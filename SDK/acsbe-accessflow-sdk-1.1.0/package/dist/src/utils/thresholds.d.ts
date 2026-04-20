import { type SeverityCounts } from '../types';
import { type IssuesFoundThreshold } from './config';
export type ThresholdCheckResult = {
    failures: {
        found: number;
        severity: string;
        threshold: number;
    }[];
    passed: boolean;
};
/**
 * Checks if the total issues found exceed the configured thresholds
 * @param totalIssuesFound The aggregated issues count from all tests
 * @param thresholds The configured thresholds from accessflow.config.json
 * @returns Result indicating if thresholds were exceeded and which ones failed
 */
export declare function checkThresholds(totalIssuesFound: SeverityCounts, thresholds: IssuesFoundThreshold): ThresholdCheckResult;
/**
 * Formats "Issues Found" line for localCheck=true console output
 * @param counts Aggregated issue counts by severity
 * @returns Single line e.g. "[AccessFlowSDK] Issues Found: extreme: 0, high: 2, medium: 5, low: 10"
 */
export declare function formatIssuesFound(counts: SeverityCounts): string;
/**
 * Formats threshold failure message for console output
 * @param failures Array of threshold failures
 * @returns Formatted error message
 */
export declare function formatThresholdFailureMessage(failures: ThresholdCheckResult['failures']): string;
