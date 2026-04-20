import { type IBrowserDriver } from '../types';
/**
 * Cypress adapter that implements the IBrowserDriver interface.
 * This is a skeleton implementation that will be completed when Cypress support is added.
 *
 * Note: Cypress has a fundamentally different execution model (commands are queued).
 * This adapter will need special handling to work with Cypress's async command chain.
 *
 * Usage example (future):
 * ```typescript
 * const accessFlowDriver = new CypressDriver();
 * const sdk = new AccessFlowSDK(accessFlowDriver);
 * ```
 */
export declare class CypressDriver implements IBrowserDriver {
    constructor();
    addInitScript(content: string): Promise<void>;
    addStyleTag(content: string): Promise<void>;
    evaluate<T>(script: ((...args: any[]) => T) | string, ...args: any[]): Promise<T>;
    getUrl(): Promise<string>;
}
