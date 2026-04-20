"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatThresholdFailureMessage = exports.formatIssuesFound = exports.checkThresholds = void 0;
/**
 * Checks if the total issues found exceed the configured thresholds
 * @param totalIssuesFound The aggregated issues count from all tests
 * @param thresholds The configured thresholds from accessflow.config.json
 * @returns Result indicating if thresholds were exceeded and which ones failed
 */
function checkThresholds(totalIssuesFound, thresholds) {
    const failures = [];
    // Check thresholds directly since field names now match severity names
    const severityKeys = ['extreme', 'high', 'medium', 'low'];
    for (const severity of severityKeys) {
        const threshold = thresholds[severity];
        const found = totalIssuesFound[severity] || 0;
        if (threshold !== undefined && found > threshold) {
            failures.push({
                found,
                severity,
                threshold,
            });
        }
    }
    return {
        failures,
        passed: failures.length === 0,
    };
}
exports.checkThresholds = checkThresholds;
/**
 * Formats "Issues Found" line for localCheck=true console output
 * @param counts Aggregated issue counts by severity
 * @returns Single line e.g. "[AccessFlowSDK] Issues Found: extreme: 0, high: 2, medium: 5, low: 10"
 */
function formatIssuesFound(counts) {
    const parts = ['extreme', 'high', 'medium', 'low'].map((sev) => { var _a; return `${sev}: ${(_a = counts[sev]) !== null && _a !== void 0 ? _a : 0}`; });
    return `[AccessFlowSDK] Issues Found: ${parts.join(', ')}`;
}
exports.formatIssuesFound = formatIssuesFound;
/**
 * Formats threshold failure message for console output
 * @param failures Array of threshold failures
 * @returns Formatted error message
 */
function formatThresholdFailureMessage(failures) {
    const messages = failures.map((failure) => `  - ${failure.severity}: found ${failure.found}, threshold ${failure.threshold}`);
    return `[AccessFlowSDK] Test suite failed due to accessibility issues exceeding configured thresholds:\n${messages.join('\n')}`;
}
exports.formatThresholdFailureMessage = formatThresholdFailureMessage;
