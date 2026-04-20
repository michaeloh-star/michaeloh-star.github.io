"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaywrightDriver = void 0;
const driver_common_1 = require("./driver-common");
/**
 * Playwright adapter that implements the IBrowserDriver interface.
 * This allows the SDK to work with Playwright's Page object.
 */
class PlaywrightDriver {
    constructor(page) {
        this.page = page;
    }
    async addInitScript(content) {
        await this.page.addInitScript({ content });
    }
    async addStyleTag(content) {
        try {
            await this.page.addStyleTag({ content });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('[AccessFlowSDK] PlaywrightDriver: addStyleTag failed (will try evaluate fallback).', msg);
        }
    }
    async evaluate(script, ...args) {
        if (typeof script === 'string') {
            return this.page.evaluate((code) => {
                try {
                    return eval(code);
                }
                catch (error) {
                    throw new Error(`Failed to evaluate script: ${error instanceof Error ? error.message : String(error)}`);
                }
            }, script);
        }
        return this.page.evaluate(script, (0, driver_common_1.getEvaluateSingleArg)(args));
    }
    /**
     * Get the underlying Playwright page object.
     * Useful for framework-specific operations not covered by IBrowserDriver.
     */
    getPage() {
        return this.page;
    }
    async getUrl() {
        return this.page.url();
    }
}
exports.PlaywrightDriver = PlaywrightDriver;
