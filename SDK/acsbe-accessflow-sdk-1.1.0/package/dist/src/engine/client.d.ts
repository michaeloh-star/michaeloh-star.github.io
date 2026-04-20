import { type IAudits } from '../types';
/**
 * Client for interacting with the aflow-core CLI engine.
 * This allows the SDK to use the CLI as a sidecar for cross-language compatibility.
 */
export declare class EngineClient {
    private cliPath;
    constructor(cliPath?: string);
    /**
     * Extract assets to a directory using the CLI.
     */
    extractAssets(outputDir: string): void;
    /**
     * Finalize and aggregate all recorded audits.
     */
    finalize(runId: string, outputDir?: string, apiKey?: string, context?: any): void;
    /**
     * Process audit data using the CLI and return the summary.
     * Handles large data by writing to a temporary file.
     */
    process(audits: IAudits, url: string): any;
    /**
     * Record an audit result for later aggregation.
     */
    record(runId: string, audits: IAudits, url: string, outputDir?: string): void;
    /**
     * Verify an API key using the CLI.
     */
    verifyKey(apiKey: string): boolean;
}
