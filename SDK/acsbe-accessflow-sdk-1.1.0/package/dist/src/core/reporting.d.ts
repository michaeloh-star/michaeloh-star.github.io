import { type TestInfo } from 'playwright/test';
import { type AuditReport, type IAudits, type ReportExportType } from '../types';
export declare function generateReport(auditorResults: IAudits | undefined, reportExportType: ReportExportType | undefined, url: string, testInfo?: TestInfo): AuditReport;
export declare function generateJsonReport(report: AuditReport, url: string, testInfo?: TestInfo): void;
export declare function generateFinalSummaryReport(testInfo?: TestInfo): void;
export declare function saveAuditForTeardown(auditResult: {
    audit: IAudits;
    url: string;
}, testInfo?: TestInfo): void;
