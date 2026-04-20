import { type IAudits, type RuleSummary, type Severity } from '../../types';
/**
 * Summarize audit results by counting issues by severity and creating rule summaries.
 * This is the core business logic extracted for use in both SDK and CLI.
 */
export declare function summarizeAudits(audits: IAudits | IAudits[]): {
    orderedSeverityCounts: Partial<Record<Severity, number>>;
    ruleSummaries: Record<string, RuleSummary>;
};
