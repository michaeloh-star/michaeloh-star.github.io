"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessFlowSDK = void 0;
const playwright_1 = require("../drivers/playwright");
const ciInfo_1 = require("../utils/ciInfo");
const token_1 = require("../utils/token");
const audit_1 = require("./audit");
const reporting_1 = require("./reporting");
// Removed AccessFlowSDKOptions - no longer needed without CLI support
class AccessFlowSDK {
    /**
     * Create a new AccessFlowSDK instance.
     * @param pageOrDriver Either a Playwright Page object (for backward compatibility) or an IBrowserDriver instance
     * @param testInfo Optional Playwright TestInfo for attaching reports to test results
     */
    constructor(pageOrDriver, testInfo) {
        this.testInfo = testInfo;
        this.ciInfo = null;
        this.initializedFlag = { value: false };
        // Check if it's a Playwright page (backward compatibility)
        if (this.isPlaywrightPage(pageOrDriver)) {
            this.driver = new playwright_1.PlaywrightDriver(pageOrDriver);
        }
        else {
            // It's already an IBrowserDriver
            this.driver = pageOrDriver;
        }
        if (!this.ciInfo) {
            this.ciInfo = (0, ciInfo_1.detectCiInfo)();
        }
    }
    static init(opts) {
        (0, token_1.setApiKey)(opts.apiKey);
    }
    isPlaywrightPage(obj) {
        return (typeof obj === 'object' &&
            typeof obj.goto === 'function' &&
            typeof obj.url === 'function' &&
            typeof obj.evaluate === 'function' &&
            typeof obj.addInitScript === 'function');
    }
    async audit() {
        await (0, token_1.verifyApiKey)();
        const audit = await (0, audit_1.runAudit)(this.driver, this.initializedFlag);
        // Save audit result for cross-process aggregation (Playwright globalTeardown compatibility)
        // This is independent of generateReport() which is for local user reports.
        // Only record when the audit has actual results and a valid URL — an empty {}
        // means the auditor ran but found nothing, which should not produce a report entry.
        if (audit && Object.keys(audit).length > 0) {
            const url = await this.driver.getUrl();
            if (url) {
                (0, reporting_1.saveAuditForTeardown)({
                    audit,
                    url,
                }, this.testInfo);
            }
        }
        return audit;
    }
    async generateReport(auditorResults, reportExportType) {
        // Use in-memory JavaScript processing for optimal performance
        const url = await this.driver.getUrl();
        return (0, reporting_1.generateReport)(auditorResults, reportExportType, url, this.testInfo);
    }
    /**
     * Get the underlying driver instance.
     * Useful for framework-specific operations.
     */
    getDriver() {
        return this.driver;
    }
    /**
     * Update the browser driver (for Playwright backward compatibility).
     * @param pageOrDriver Either a Playwright Page object or an IBrowserDriver instance
     */
    updatePage(pageOrDriver) {
        if (this.isPlaywrightPage(pageOrDriver)) {
            this.driver = new playwright_1.PlaywrightDriver(pageOrDriver);
        }
        else {
            this.driver = pageOrDriver;
        }
        this.initializedFlag.value = false;
    }
    updateTestInfo(testInfo) {
        this.testInfo = testInfo;
    }
}
exports.AccessFlowSDK = AccessFlowSDK;
exports.default = AccessFlowSDK;
