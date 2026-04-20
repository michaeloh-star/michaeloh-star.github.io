import { type IBrowserDriver, type PlaywrightPage } from '../types';
/**
 * Playwright adapter that implements the IBrowserDriver interface.
 * This allows the SDK to work with Playwright's Page object.
 */
export declare class PlaywrightDriver implements IBrowserDriver {
    private page;
    constructor(page: PlaywrightPage);
    addInitScript(content: string): Promise<void>;
    addStyleTag(content: string): Promise<void>;
    evaluate<T>(script: ((...args: any[]) => T) | string, ...args: any[]): Promise<T>;
    /**
     * Get the underlying Playwright page object.
     * Useful for framework-specific operations not covered by IBrowserDriver.
     */
    getPage(): PlaywrightPage;
    getUrl(): Promise<string>;
}
