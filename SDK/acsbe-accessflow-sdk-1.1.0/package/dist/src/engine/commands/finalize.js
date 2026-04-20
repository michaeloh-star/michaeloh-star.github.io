"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizeCommand = void 0;
const commander_1 = require("commander");
const fs_1 = require("fs");
const path_1 = require("path");
const auditReport_1 = require("../../api/auditReport");
const rules_json_1 = __importDefault(require("../../assets/rules.json"));
const ciInfo_1 = require("../../utils/ciInfo");
const config_1 = require("../../utils/config");
const thresholds_1 = require("../../utils/thresholds");
const summarizer_1 = require("../lib/summarizer");
exports.finalizeCommand = new commander_1.Command('finalize')
    .description('Aggregate all recorded audits and generate final summary report')
    .requiredOption('--id <runId>', 'Unique identifier for this test run')
    .option('--output <dir>', 'Output directory for state files', 'test-results')
    .option('--api-key <key>', 'API key for cloud upload')
    .option('--context <json>', 'CI/CD context override as JSON')
    .action(async (options) => {
    try {
        const outputDir = (0, path_1.resolve)(options.output);
        const stateFile = (0, path_1.join)(outputDir, `aflow-state-${options.id}.jsonl`);
        console.log(`[aflow-core] Finalizing run ${options.id}`);
        console.log(`[aflow-core] Looking for state file: ${stateFile}`);
        // Check if state file exists
        if (!(0, fs_1.existsSync)(stateFile)) {
            console.warn(`[aflow-core] No state file found for run ${options.id}`);
            console.log('[aflow-core] This may be a local run without recorded audits');
            process.exit(0);
        }
        // Read all audit records from the state file
        const fileContent = (0, fs_1.readFileSync)(stateFile, 'utf-8');
        const lines = fileContent.split('\n').filter((line) => line.trim() !== '');
        console.log(`[aflow-core] Found ${lines.length} audit records`);
        const summaryByUrl = {};
        const processedSelectorsSet = new Set();
        const totalNumberOfIssuesFound = {
            extreme: 0,
            high: 0,
            low: 0,
            medium: 0,
        };
        // Process each audit record
        for (const line of lines) {
            try {
                const { audit, url } = JSON.parse(line);
                const { orderedSeverityCounts, ruleSummaries } = (0, summarizer_1.summarizeAudits)(audit);
                summaryByUrl[url] = {
                    numberOfIssuesFound: orderedSeverityCounts,
                    ruleViolations: ruleSummaries,
                };
                // Track unique selectors across all pages to match backend deduplication logic
                for (const ruleKey in ruleSummaries) {
                    const ruleSummary = ruleSummaries[ruleKey];
                    const rule = rules_json_1.default.find((r) => r.shortCode === ruleKey);
                    if (!rule)
                        continue;
                    const severity = ruleSummary.severity.toLowerCase();
                    // Process each selector only once across all pages
                    for (const selector of ruleSummary.selectors) {
                        const issueKey = `${ruleSummary.name}:${selector}`;
                        if (!processedSelectorsSet.has(issueKey)) {
                            processedSelectorsSet.add(issueKey);
                            totalNumberOfIssuesFound[severity] = (totalNumberOfIssuesFound[severity] || 0) + 1;
                        }
                    }
                }
            }
            catch (error) {
                console.warn('[aflow-core] Failed to parse audit record:', error);
            }
        }
        // Detect CI info or use provided context
        let ciInfo = options.context ? JSON.parse(options.context) : (0, ciInfo_1.detectCiInfo)();
        console.log(`[aflow-core] Processed ${Object.keys(summaryByUrl).length} unique URLs`);
        console.log(`[aflow-core] CI environment detected: ${ciInfo ? 'Yes' : 'No'}`);
        // Build final report
        const finalReport = {
            pages: summaryByUrl,
            totalNumberOfIssuesFound,
        };
        if (ciInfo) {
            finalReport.ciInfo = ciInfo;
        }
        // Load configuration and add thresholds
        const config = (0, config_1.loadAccessFlowConfig)();
        if (config === null || config === void 0 ? void 0 : config.issuesFoundThreshold) {
            finalReport.configuredThresholds = config.issuesFoundThreshold;
        }
        // Write final summary report
        const summaryPath = (0, path_1.join)(outputDir, 'accessFlow-report-summary.json');
        (0, fs_1.writeFileSync)(summaryPath, JSON.stringify(finalReport, null, 2));
        console.log(`[aflow-core] Summary report written to ${summaryPath}`);
        // Upload to cloud if API key is provided and CI info is available
        if (options.apiKey && ciInfo) {
            console.log('[aflow-core] Uploading report to AccessFlow cloud...');
            const uploadSuccess = await (0, auditReport_1.uploadAuditReport)(options.apiKey, finalReport);
            if (uploadSuccess) {
                console.log('[aflow-core] Report uploaded successfully');
            }
            else {
                console.warn('[aflow-core] Report upload failed');
            }
        }
        else if (!ciInfo) {
            console.log('[aflow-core] Skipping cloud upload (not in CI environment)');
        }
        // Check thresholds if configured (localCheck=true)
        if ((config === null || config === void 0 ? void 0 : config.issuesFoundThreshold) && config.localCheck === true) {
            console.log((0, thresholds_1.formatIssuesFound)(totalNumberOfIssuesFound));
            const thresholdResult = (0, thresholds_1.checkThresholds)(totalNumberOfIssuesFound, config.issuesFoundThreshold);
            if (thresholdResult.passed) {
                console.log('[AccessFlowSDK] Tests passed (issues within configured thresholds).');
            }
            else {
                const errorMessage = (0, thresholds_1.formatThresholdFailureMessage)(thresholdResult.failures);
                console.error('[AccessFlowSDK] Tests failed (thresholds exceeded).');
                console.error(errorMessage);
                (0, fs_1.unlinkSync)(stateFile);
                process.exit(1);
            }
            console.log(`[AccessFlowSDK] Final report: ${summaryPath}`);
            // Keep summary file when localCheck=true so user can inspect it
        }
        // Clean up state file
        (0, fs_1.unlinkSync)(stateFile);
        // Clean up summary report when not in CI and not localCheck (report kept for localCheck users)
        if (!ciInfo && (config === null || config === void 0 ? void 0 : config.localCheck) !== true) {
            try {
                (0, fs_1.unlinkSync)(summaryPath);
            }
            catch { }
        }
        console.log('[aflow-core] Finalization complete');
        process.exit(0);
    }
    catch (error) {
        console.error('[aflow-core] Error during finalization:', error);
        process.exit(2);
    }
});
