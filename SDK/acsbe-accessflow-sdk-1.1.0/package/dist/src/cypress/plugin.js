"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAccessFlowTasks = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const auditReport_1 = require("../api/auditReport");
const reporting_1 = require("../core/reporting");
const config_1 = require("../utils/config");
const fs_2 = require("../utils/fs");
const output_1 = require("../utils/output");
const thresholds_1 = require("../utils/thresholds");
const token_1 = require("../utils/token");
/**
 * Asset cache for auditor.js and auditor.css
 * Loads once on first task call, reused for all subsequent calls
 */
let cachedAssets = null;
/**
 * Load auditor assets from disk (cached after first load)
 */
function loadAuditorAssets() {
    if (cachedAssets) {
        return cachedAssets;
    }
    // Determine base directory (matches audit.ts logic)
    const { sep } = path_1.default;
    const baseDir = __dirname.includes(`${sep}dist${sep}`) || __dirname.endsWith(`${sep}dist`) ?
        path_1.default.join(__dirname, '..', 'assets')
        : path_1.default.join(__dirname, '..', '..', 'dist', 'src', 'assets');
    const scriptPath = path_1.default.join(baseDir, 'auditor.js');
    const stylePath = path_1.default.join(baseDir, 'auditor.css');
    cachedAssets = {
        auditorJs: (0, fs_1.readFileSync)(scriptPath, 'utf-8'),
        auditorCss: (0, fs_1.readFileSync)(stylePath, 'utf-8'),
    };
    return cachedAssets;
}
/**
 * Get the output directory for reports (defaults to './test-results')
 */
function getOutputDir() {
    // Match Playwright SDK behavior: use test-results in CWD
    return path_1.default.resolve(process.cwd(), 'test-results');
}
/**
 * Register AccessFlow Cypress tasks and after:run event handler
 * Call this in setupNodeEvents in cypress.config.ts
 *
 * @example
 * ```typescript
 * import { registerAccessFlowTasks } from '@acsbe/accessflow-sdk/cypress';
 *
 * export default defineConfig({
 *   e2e: {
 *     setupNodeEvents(on, config) {
 *       registerAccessFlowTasks(on, config);
 *     },
 *   },
 * });
 * ```
 */
function registerAccessFlowTasks(on, config) {
    /**
     * accessflow:init - Load auditor assets and verify API key
     * Returns { auditorJs, auditorCss } for browser-side injection
     */
    on('task', {
        'accessflow:init': async () => {
            const assets = loadAuditorAssets();
            // Verify API key if available (non-blocking for local dev)
            try {
                const { getAccessFlowBaseUrl } = require('../../sdk.config');
                const baseUrl = getAccessFlowBaseUrl();
                if (baseUrl !== null) {
                    await (0, token_1.verifyApiKey)();
                    console.log('[AccessFlowSDK] API key verified successfully');
                }
            }
            catch (error) {
                // Don't block tests if verification fails in local dev
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn('[AccessFlowSDK] API key verification failed (non-blocking):', errorMessage);
            }
            return assets;
        },
        /**
         * accessflow:process - Process raw audits and return AuditReport
         * Takes { rawAudits, url } and returns summarized AuditReport
         */
        'accessflow:process': ({ rawAudits, url }) => {
            const auditReport = (0, reporting_1.generateReport)(rawAudits, undefined, url);
            return auditReport;
        },
        /**
         * accessflow:record - Record audit for aggregation in after:run
         * Takes { audit, url } and appends to JSONL file
         */
        'accessflow:record': ({ audit, url }) => {
            const dir = getOutputDir();
            (0, fs_2.ensureDirExists)(dir);
            // Save output dir path for global teardown
            (0, output_1.saveOutputDirPath)(dir);
            // Use process ID for unique files per worker (matches saveAuditForTeardown logic)
            const filePath = path_1.default.resolve(dir, `accessFlow-raw-audits-${process.pid}.jsonl`);
            try {
                (0, fs_1.appendFileSync)(filePath, `${JSON.stringify({ audit, url })}\n`);
                // Log first few saves per process
                if (!globalThis.__accessFlowAuditCount) {
                    globalThis.__accessFlowAuditCount = {};
                }
                const count = (globalThis.__accessFlowAuditCount[process.pid] || 0) + 1;
                globalThis.__accessFlowAuditCount[process.pid] = count;
                if (count <= 3 || count % 10 === 0) {
                    console.log(`[AccessFlowSDK] Saved audit #${count} for process ${process.pid} (URL: ${url}) to ${path_1.default.basename(filePath)}`);
                }
            }
            catch (error) {
                console.error('[AccessFlowSDK] Failed to save audit for teardown:', error);
                console.error('[AccessFlowSDK] File path:', filePath);
                console.error('[AccessFlowSDK] Current working directory:', process.cwd());
            }
            return null; // Cypress tasks must return a value
        },
    });
    /**
     * after:run - Finalize, aggregate, and upload reports after all specs complete
     * Mirrors global-teardown.ts behavior for Cypress
     */
    on('after:run', async () => {
        console.log('[AccessFlowSDK] Starting Cypress after:run teardown...');
        // Generate final summary report from JSONL files
        (0, reporting_1.generateFinalSummaryReport)();
        const outputDir = (0, output_1.getSavedOutputDir)();
        const reportPath = path_1.default.resolve(outputDir, 'accessFlow-report-summary.json');
        // Check if report file exists
        if (!existsSync(reportPath)) {
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
            console.error('[AccessFlowSDK] Failed to read or parse report summary:', e);
            return;
        }
        // Load configuration
        const config = (0, config_1.loadAccessFlowConfig)();
        // Add thresholds to report if configured
        if (config === null || config === void 0 ? void 0 : config.issuesFoundThreshold) {
            report.configuredThresholds = config.issuesFoundThreshold;
            writeFileSync(reportPath, JSON.stringify(report, null, 2));
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
        // Upload report BEFORE checking thresholds
        const { getAccessFlowBaseUrl } = require('../../sdk.config');
        const baseUrl = getAccessFlowBaseUrl();
        if (baseUrl !== null) {
            console.log('[AccessFlowSDK] Verifying API key...');
            try {
                await (0, token_1.verifyApiKey)();
                console.log('[AccessFlowSDK] API key verified successfully, attempting to upload report...');
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
        // Check thresholds AFTER upload
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
    });
}
exports.registerAccessFlowTasks = registerAccessFlowTasks;
// Add missing import
function existsSync(p) {
    try {
        return require('fs').existsSync(p);
    }
    catch {
        return false;
    }
}
function writeFileSync(p, data) {
    require('fs').writeFileSync(p, data);
}
