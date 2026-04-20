import { type TestInfo } from 'playwright/test';
import { type AuditReport, type IAudits, type IBrowserDriver, type PlaywrightPage, type ReportExportType } from '../types';
export declare class AccessFlowSDK {
    private testInfo?;
    private ciInfo;
    private driver;
    private initializedFlag;
    /**
     * Create a new AccessFlowSDK instance.
     * @param pageOrDriver Either a Playwright Page object (for backward compatibility) or an IBrowserDriver instance
     * @param testInfo Optional Playwright TestInfo for attaching reports to test results
     */
    constructor(pageOrDriver: IBrowserDriver | PlaywrightPage, testInfo?: TestInfo | undefined);
    static init(opts: {
        apiKey: string;
    }): void;
    private isPlaywrightPage;
    audit(): Promise<IAudits | undefined>;
    generateReport(auditorResults: IAudits | undefined, reportExportType?: ReportExportType): Promise<AuditReport>;
    /**
     * Get the underlying driver instance.
     * Useful for framework-specific operations.
     */
    getDriver(): IBrowserDriver;
    /**
     * Update the browser driver (for Playwright backward compatibility).
     * @param pageOrDriver Either a Playwright Page object or an IBrowserDriver instance
     */
    updatePage(pageOrDriver: IBrowserDriver | PlaywrightPage): void;
    updateTestInfo(testInfo: TestInfo): void;
}
export default AccessFlowSDK;
