"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const auditReport_1 = require("../api/auditReport");
const reporting_1 = require("../core/reporting");
const config_1 = require("../utils/config");
const output_1 = require("../utils/output");
const thresholds_1 = require("../utils/thresholds");
const token_1 = require("../utils/token");
async function accessFlowSdkGlobalTeardown() {
    console.log('[AccessFlowSDK] Starting global teardown...');
    // Always try to generate the final summary report if raw audits exist
    (0, reporting_1.generateFinalSummaryReport)();
    const outputDir = (0, output_1.getSavedOutputDir)();
    const reportPath = path_1.default.resolve(outputDir, 'accessFlow-report-summary.json');
    // Check if report file exists before trying to read it
    if (!(0, fs_1.existsSync)(reportPath)) {
        console.log('[AccessFlowSDK] No CI/CD summary report found.');
        console.log('[AccessFlowSDK] This is expected for local test runs. Local reports (JSON) are available in the output directory.');
        return;
    }
    console.log('[AccessFlowSDK] Report summary found, processing...');
    let report;
    try {
        report = JSON.parse((0, fs_1.readFileSync)(reportPath, 'utf-8'));
    }
    catch (e) {
        console.error('Failed to read or parse report summary:', e);
        return;
    }
    // Load configuration
    const config = (0, config_1.loadAccessFlowConfig)();
    // Always add thresholds to the final report if they exist in config
    if (config === null || config === void 0 ? void 0 : config.issuesFoundThreshold) {
        report.configuredThresholds = config.issuesFoundThreshold;
        // Write updated report back to file
        (0, fs_1.writeFileSync)(reportPath, JSON.stringify(report, null, 2));
    }
    // Local run (no CI info): skip upload but still check thresholds
    if (!report.ciInfo) {
        console.log('[AccessFlowSDK] Report has no CI info (local run). Skipping cloud upload.');
        if ((config === null || config === void 0 ? void 0 : config.issuesFoundThreshold) && report.totalNumberOfIssuesFound && config.localCheck === true) {
            console.log((0, thresholds_1.formatIssuesFound)(report.totalNumberOfIssuesFound));
            const thresholdResult = (0, thresholds_1.checkThresholds)(report.totalNumberOfIssuesFound, config.issuesFoundThreshold);
            if (thresholdResult.passed) {
                console.log('[AccessFlowSDK] Tests passed (issues within configured thresholds).');
            }
            else {
                const errorMessage = (0, thresholds_1.formatThresholdFailureMessage)(thresholdResult.failures);
                console.error('[AccessFlowSDK] Tests failed (thresholds exceeded).');
                console.error(errorMessage);
                (0, output_1.cleanupOutputDirMarker)(outputDir);
                throw new Error(errorMessage);
            }
            console.log(`[AccessFlowSDK] Final report: ${reportPath}`);
        }
        (0, output_1.cleanupOutputDirMarker)(outputDir);
        return;
    }
    // Upload report BEFORE checking thresholds, so reports are uploaded even if thresholds are exceeded
    // Verify API key before attempting upload (only if cloud URL is available)
    const { getAccessFlowBaseUrl } = require('../../sdk.config');
    const baseUrl = getAccessFlowBaseUrl();
    if (baseUrl !== null) {
        console.log('[AccessFlowSDK] Verifying API key...');
        try {
            await (0, token_1.verifyApiKey)();
            console.log('[AccessFlowSDK] API key verified successfully, attempting to upload report...');
            // Get the API key for upload
            let apiKey;
            try {
                apiKey = (0, token_1.getApiKey)();
                try {
                    const uploadSuccess = await (0, auditReport_1.uploadAuditReport)(apiKey, report);
                    if (!uploadSuccess) {
                        console.log(`[AccessFlowSDK] Report upload skipped or failed. Reports are available locally in ${outputDir}`);
                    }
                    else {
                        console.log('[AccessFlowSDK] Audit report uploaded successfully.');
                    }
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.warn('[AccessFlowSDK] Error during report upload:', errorMessage);
                    console.log(`[AccessFlowSDK] Reports are still available locally in ${outputDir}`);
                    // Don't throw - allow tests to complete successfully even if upload fails
                }
            }
            catch (error) {
                console.warn('[AccessFlowSDK] API key not available; skipping report upload.');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.warn('[AccessFlowSDK] API key verification failed; skipping report upload.');
            console.log('[AccessFlowSDK] Error:', errorMessage);
        }
    }
    else {
        console.log('[AccessFlowSDK] Cloud URL not available - skipping API key verification and cloud upload.');
    }
    // Check thresholds AFTER upload, so reports are uploaded even if thresholds are exceeded
    // This allows users to see threshold violations in the AccessFlow dashboard
    if ((config === null || config === void 0 ? void 0 : config.issuesFoundThreshold) && report.totalNumberOfIssuesFound && config.localCheck === true) {
        console.log((0, thresholds_1.formatIssuesFound)(report.totalNumberOfIssuesFound));
        const thresholdResult = (0, thresholds_1.checkThresholds)(report.totalNumberOfIssuesFound, config.issuesFoundThreshold);
        if (thresholdResult.passed) {
            console.log('[AccessFlowSDK] Tests passed (issues within configured thresholds).');
        }
        else {
            const errorMessage = (0, thresholds_1.formatThresholdFailureMessage)(thresholdResult.failures);
            console.error('[AccessFlowSDK] Tests failed (thresholds exceeded).');
            console.error(errorMessage);
            (0, output_1.cleanupOutputDirMarker)(outputDir);
            throw new Error(errorMessage);
        }
        console.log(`[AccessFlowSDK] Final report: ${reportPath}`);
    }
    // Clean up the output directory marker file
    (0, output_1.cleanupOutputDirMarker)(outputDir);
}
exports.default = accessFlowSdkGlobalTeardown;
