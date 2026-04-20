"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeleniumDriver = void 0;
const driver_common_1 = require("./driver-common");
/**
 * Selenium WebDriver adapter that implements the IBrowserDriver interface.
 * Use this when running AccessFlow audits with Selenium (e.g. selenium-webdriver)
 *
 * Selenium has no "init script" that runs before page load; addInitScript is a no-op and the
 * auditor is injected via the evaluate-based fallback in ensureInit.
 *
 * Usage:
 * ```typescript
 * import { Builder } from 'selenium-webdriver';
 * import { AccessFlowSDK, SeleniumDriver } from '@acsbe/accessflow-sdk';
 *
 * const driver = await new Builder().forBrowser('chrome').build();
 * await driver.get('https://example.com');
 * const sdk = new AccessFlowSDK(new SeleniumDriver(driver));
 * const audits = await sdk.audit();
 * const report = await sdk.generateReport(audits);
 * await driver.quit();
 * ```
 */
class SeleniumDriver {
    constructor(driver) {
        this.driver = driver;
    }
    async addInitScript(_content) {
        // No-op: Selenium has no "before page scripts" hook. The auditor script is injected
        // via the evaluate-based fallback in ensureInit (creating a <script> element), which
        // always runs after this call. Attempting eval() here would be redundant and fragile
        // (blocked by CSP `unsafe-eval`), so we skip it entirely.
    }
    async addStyleTag(content) {
        // Best-effort like Playwright: on failure (CSP, missing document.head), log and continue
        // so ensureInit can run the evaluate-based fallback and audits still run.
        try {
            await this.driver.executeScript((0, driver_common_1.getStyleInjectionScript)(), content);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('[AccessFlowSDK] SeleniumDriver: style injection failed (will try evaluate fallback).', msg);
        }
    }
    async evaluate(script, ...args) {
        try {
            if (typeof script === 'function') {
                const scriptStr = (0, driver_common_1.getFunctionScriptString)(script);
                const singleArg = (0, driver_common_1.getEvaluateSingleArg)(args);
                const result = await this.driver.executeScript(scriptStr, singleArg);
                return result;
            }
            // Selenium executeScript needs "return" to retrieve a value
            const execScript = script.trimStart().startsWith('return') ? script : `return ${script}`;
            const result = await this.driver.executeScript(execScript, ...args);
            return result;
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            throw new Error(`AccessFlowSDK: Script execution failed. ${msg}`);
        }
    }
    async getUrl() {
        const url = await this.driver.getCurrentUrl();
        return typeof url === 'string' ? url : String(url);
    }
}
exports.SeleniumDriver = SeleniumDriver;
