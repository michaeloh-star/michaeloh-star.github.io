import { type IBrowserDriver } from '../types';
/**
 * Minimal interface for a Selenium WebDriver-compatible object.
 * Use with `selenium-webdriver` (Builder().forBrowser('chrome').build()) or any compatible driver.
 */
export type SeleniumWebDriverLike = {
    executeScript: (script: string, ...args: unknown[]) => Promise<unknown>;
    getCurrentUrl: () => Promise<string>;
};
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
export declare class SeleniumDriver implements IBrowserDriver {
    private driver;
    constructor(driver: SeleniumWebDriverLike);
    addInitScript(_content: string): Promise<void>;
    addStyleTag(content: string): Promise<void>;
    evaluate<T>(script: ((...args: any[]) => T) | string, ...args: any[]): Promise<T>;
    getUrl(): Promise<string>;
}
