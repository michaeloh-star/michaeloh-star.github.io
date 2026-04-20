"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveAuditForTeardown = exports.generateFinalSummaryReport = exports.generateJsonReport = exports.generateReport = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const rules_json_1 = __importDefault(require("../assets/rules.json")); //TODO: once scanner is merged to the monorep we should take the rules from the app
const ciInfo_1 = require("../utils/ciInfo");
const fs_2 = require("../utils/fs");
const output_1 = require("../utils/output");
function summarizeAudits(audits) {
    var _a, _b;
    const severityCounts = {};
    const ruleSummaries = {};
    const auditsArray = Array.isArray(audits) ? audits : [audits];
    for (const auditorResults of auditsArray) {
        for (const shortCode in auditorResults) {
            const audit = auditorResults[shortCode];
            if (!audit || audit.success)
                continue;
            const rule = rules_json_1.default.find((r) => r.shortCode === shortCode);
            if (!rule)
                continue;
            const severity = rule.severity.toLowerCase();
            let occurrences = 0;
            const selectorSet = new Set();
            const selectors = [];
            // Track HTML, suggestionLabel, and suggestionType per selector (backend creates one issue per unique selector)
            const selectorDataMap = new Map();
            for (const issue in audit) {
                const report = audit[issue];
                if (!report.success) {
                    occurrences += 1;
                    // Track unique selectors (backend creates one issue per unique selector)
                    if (!selectorSet.has(report.selector)) {
                        selectorSet.add(report.selector);
                        selectors.push(report.selector);
                        // Store HTML and suggestion data for this selector (use first occurrence's data)
                        selectorDataMap.set(report.selector, {
                            HTML: report.HTML || '',
                            suggestionLabel: report.suggestionLabel || '',
                            suggestionType: report.suggestionType || '',
                        });
                    }
                }
            }
            if (occurrences > 0) {
                // Count unique selectors (one issue per selector in the backend)
                const uniqueSelectorCount = selectorSet.size;
                // Build selector-specific data array for backend processing
                // The backend creates one issue per selector, so we need HTML per selector
                const selectorDataArray = selectors.map((selector) => {
                    const data = selectorDataMap.get(selector) || { HTML: '', suggestionLabel: '', suggestionType: '' };
                    return {
                        HTML: data.HTML,
                        selector,
                        suggestionLabel: data.suggestionLabel,
                        suggestionType: data.suggestionType,
                    };
                });
                // Get HTML and suggestion data from first selector for backward compatibility
                const firstSelectorData = selectorDataMap.get(selectors[0]) || {
                    HTML: '',
                    suggestionLabel: '',
                    suggestionType: '',
                };
                ruleSummaries[rule.shortCode] = {
                    name: rule.name,
                    numberOfOccurrences: occurrences,
                    severity,
                    ...(rule.WCAGLevel && rule.WCAGLevel !== 'none' ? { WCAGLevel: rule.WCAGLevel } : {}),
                    description: rule.shortDescription,
                    selectors,
                    WCAGLink: (_a = rule.issueWCAGLinks) === null || _a === void 0 ? void 0 : _a[0],
                    ...(((_b = rule.issueWCAGLinks) === null || _b === void 0 ? void 0 : _b.length) ? { WCAGLinks: rule.issueWCAGLinks } : {}),
                    // Include suggestedFix data if available (using first selector for backward compatibility)
                    ...(firstSelectorData.HTML || firstSelectorData.suggestionLabel ?
                        {
                            suggestedFix: {
                                HTML: firstSelectorData.HTML,
                                suggestionLabel: firstSelectorData.suggestionLabel,
                                suggestionType: firstSelectorData.suggestionType,
                            },
                        }
                        : {}),
                    // Include selector-specific data for backend processing
                    // This allows the backend to get HTML per selector when creating cicd issues
                    selectorData: selectorDataArray,
                };
                // Count unique selectors, not occurrences (backend creates one issue per unique selector)
                severityCounts[severity] = (severityCounts[severity] || 0) + uniqueSelectorCount;
            }
        }
    }
    // Order severity counts
    const orderedSeverityCounts = {};
    for (const sev of ['extreme', 'high', 'medium', 'low']) {
        if (typeof severityCounts[sev] !== 'undefined') {
            orderedSeverityCounts[sev] = severityCounts[sev];
        }
    }
    return { orderedSeverityCounts, ruleSummaries };
}
/**
 * Detects device type (desktop/mobile) from Playwright TestInfo
 */
function detectDeviceInfo(testInfo) {
    if (!testInfo || !testInfo.project) {
        return undefined;
    }
    const use = testInfo.project.use || {};
    // Check if it's explicitly marked as mobile
    const isMobile = use.isMobile || false;
    // Also check viewport size as fallback - mobile devices typically have width < 768px
    const viewport = use.viewport;
    const isMobileViewport = viewport && viewport.width < 768;
    return {
        deviceType: isMobile || isMobileViewport ? 'mobile' : 'desktop',
    };
}
function generateReport(auditorResults, reportExportType, url, testInfo) {
    // Handle undefined auditorResults by returning an empty report
    if (!auditorResults) {
        return {
            deviceInfo: detectDeviceInfo(testInfo),
            numberOfIssuesFound: {},
            ruleViolations: {},
        };
    }
    const { orderedSeverityCounts, ruleSummaries } = summarizeAudits(auditorResults);
    const report = {
        deviceInfo: detectDeviceInfo(testInfo),
        numberOfIssuesFound: orderedSeverityCounts,
        ruleViolations: ruleSummaries,
    };
    if (reportExportType === 'json')
        generateJsonReport(report, url, testInfo);
    return report;
}
exports.generateReport = generateReport;
function generateJsonReport(report, url, testInfo) {
    const dir = (0, output_1.getOutputDir)(testInfo);
    const filePath = path_1.default.resolve(dir, 'accessFlow-report.json');
    if (testInfo && Array.isArray(testInfo.attachments)) {
        const jsonContent = JSON.stringify(report, null, 2);
        testInfo.attachments.push({
            body: Buffer.from(jsonContent),
            contentType: 'application/json',
            name: 'accessFlow-report.json',
        });
    }
    (0, fs_2.ensureDirExists)(dir);
    let existing = {};
    if ((0, fs_1.existsSync)(filePath)) {
        try {
            const fileContent = (0, fs_1.readFileSync)(filePath, 'utf-8');
            const jsonStart = fileContent.indexOf('{');
            if (jsonStart !== -1) {
                try {
                    existing = JSON.parse(fileContent.slice(jsonStart));
                }
                catch (e) {
                    existing = {};
                }
            }
        }
        catch (error) {
            console.error('[AccessFlowSDK] Failed to read existing JSON report:', error);
            existing = {};
        }
    }
    existing[url] = report;
    try {
        (0, fs_1.writeFileSync)(filePath, JSON.stringify(existing, null, 2));
    }
    catch (error) {
        console.error('[AccessFlowSDK] Failed to write JSON report:', error);
    }
}
exports.generateJsonReport = generateJsonReport;
function generateFinalSummaryReport(testInfo) {
    const dir = (0, output_1.getSavedOutputDir)(testInfo);
    const filePath = path_1.default.resolve(dir, 'accessFlow-report-summary.json');
    (0, fs_2.ensureDirExists)(dir);
    // Find all process-specific JSONL files (created by parallel workers)
    let jsonlFiles;
    try {
        const allFiles = (0, fs_1.readdirSync)(dir);
        jsonlFiles = allFiles
            .filter((file) => file.startsWith('accessFlow-raw-audits-') && file.endsWith('.jsonl'))
            .map((file) => path_1.default.resolve(dir, file));
    }
    catch (error) {
        console.error('[AccessFlowSDK] Failed to read test-results directory:', error);
        return;
    }
    if (jsonlFiles.length === 0) {
        return;
    }
    // Only generate summary report if running in CI (not local)
    const ciInfo = (0, ciInfo_1.detectCiInfo)();
    if (!ciInfo) {
        console.log('[AccessFlowSDK] Local reports (JSON) are still available from generateReport().');
        return;
    }
    const summaryByUrl = {};
    // Track unique selectors across all pages (same logic as backend: `${ruleId}:${selector}`)
    // This ensures we don't count the same selector multiple times if it appears on different pages
    const processedSelectorsSet = new Set();
    const totalNumberOfIssuesFound = {
        extreme: 0,
        high: 0,
        low: 0,
        medium: 0,
    };
    // Read all lines from all process-specific JSONL files and aggregate
    const allLines = [];
    for (const jsonlFile of jsonlFiles) {
        try {
            const fileContent = (0, fs_1.readFileSync)(jsonlFile, 'utf-8');
            const lines = fileContent.split('\n').filter((line) => line.trim() !== '');
            console.log(`[AccessFlowSDK] Read ${lines.length} lines from ${path_1.default.basename(jsonlFile)}`);
            allLines.push(...lines);
        }
        catch (error) {
            console.error(`[AccessFlowSDK] Failed to read raw audits file ${jsonlFile}:`, error);
            // Continue processing other files
        }
    }
    console.log(`[AccessFlowSDK] Total lines read from all files: ${allLines.length}`);
    let processedLines = 0;
    let failedLines = 0;
    for (const line of allLines) {
        try {
            const { audit, url } = JSON.parse(line);
            const { orderedSeverityCounts, ruleSummaries } = summarizeAudits(audit);
            summaryByUrl[url] = {
                numberOfIssuesFound: orderedSeverityCounts,
                ruleViolations: ruleSummaries,
            };
            processedLines++;
            // Track unique selectors across all pages to match backend deduplication logic
            // Backend uses `${rule._id}:${selector}` as the key, but since we don't have rule._id in SDK,
            // we use `${ruleName}:${selector}` which matches how backend identifies rules (by name)
            for (const ruleKey in ruleSummaries) {
                const ruleSummary = ruleSummaries[ruleKey];
                const rule = rules_json_1.default.find((r) => r.shortCode === ruleKey);
                if (!rule)
                    continue;
                const severity = ruleSummary.severity.toLowerCase();
                // Process each selector only once across all pages (matching backend logic)
                // Backend deduplicates by `${ruleId}:${selector}`, we use `${ruleName}:${selector}`
                // since backend matches rules by name and creates issues per unique selector
                for (const selector of ruleSummary.selectors) {
                    const issueKey = `${ruleSummary.name}:${selector}`;
                    // Only count if we haven't seen this selector before (can appear on multiple pages)
                    if (!processedSelectorsSet.has(issueKey)) {
                        processedSelectorsSet.add(issueKey);
                        totalNumberOfIssuesFound[severity] = (totalNumberOfIssuesFound[severity] || 0) + 1;
                    }
                }
            }
        }
        catch (error) {
            failedLines++;
            // Ignore malformed lines but log for debugging
            if (failedLines <= 5) {
                console.warn(`[AccessFlowSDK] Failed to parse line ${failedLines}:`, error instanceof Error ? error.message : String(error));
            }
        }
    }
    console.log(`[AccessFlowSDK] Processed ${processedLines} audit entries successfully, ${failedLines} failed`);
    console.log(`[AccessFlowSDK] Found ${Object.keys(summaryByUrl).length} unique URLs in summary`);
    try {
        (0, fs_1.writeFileSync)(filePath, JSON.stringify({
            ciInfo,
            pages: summaryByUrl,
            totalNumberOfIssuesFound,
        }, null, 2));
        console.log(`[AccessFlowSDK] Successfully wrote summary report with ${Object.keys(summaryByUrl).length} pages to ${filePath}`);
    }
    catch (error) {
        console.error('[AccessFlowSDK] Failed to write final summary report:', error);
        return;
    }
    // Only attempt to delete the raw files after successful write
    // Delete all process-specific JSONL files
    for (const jsonlFile of jsonlFiles) {
        (0, fs_1.unlink)(jsonlFile, (err) => {
            if (err) {
                console.error(`[AccessFlowSDK] Failed to delete raw audits file ${jsonlFile}:`, err);
            }
        });
    }
}
exports.generateFinalSummaryReport = generateFinalSummaryReport;
// JSONL file used for cross-process aggregation for Playwright globalTeardown compatibility
// This is called independently after every audit() to ensure all audit results are captured
// for aggregation in the global teardown phase
// Uses process-specific files to avoid race conditions when multiple workers write concurrently
function saveAuditForTeardown(auditResult, testInfo) {
    const dir = (0, output_1.getOutputDir)(testInfo);
    (0, fs_2.ensureDirExists)(dir);
    // Save the output directory path so it can be read during global teardown
    (0, output_1.saveOutputDirPath)(dir);
    // Use process ID to create unique files per worker process to avoid race conditions
    const filePath = path_1.default.resolve(dir, `accessFlow-raw-audits-${process.pid}.jsonl`);
    try {
        (0, fs_1.appendFileSync)(filePath, `${JSON.stringify(auditResult)}\n`);
        // Log first few saves per process to help debug
        if (!globalThis.__accessFlowAuditCount) {
            globalThis.__accessFlowAuditCount = {};
        }
        const count = (globalThis.__accessFlowAuditCount[process.pid] || 0) + 1;
        globalThis.__accessFlowAuditCount[process.pid] = count;
        if (count <= 3 || count % 10 === 0) {
            console.log(`[AccessFlowSDK] Saved audit #${count} for process ${process.pid} (URL: ${auditResult.url}) to ${path_1.default.basename(filePath)}`);
        }
    }
    catch (error) {
        console.error('[AccessFlowSDK] Failed to save audit for teardown:', error);
        console.error('[AccessFlowSDK] File path:', filePath);
        console.error('[AccessFlowSDK] Current working directory:', process.cwd());
    }
}
exports.saveAuditForTeardown = saveAuditForTeardown;
