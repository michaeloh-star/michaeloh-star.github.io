import type { Response } from '@playwright/test';
export type IAudits = Record<string, Record<string, IReport>>;
export type EngineVersions = {
    auditorVersion: string;
    auditorVersionCode: number;
    classifierVersion: string;
    classifierVersionCode: number;
};
export type IReport = {
    dynamic: boolean;
    engineVersions: EngineVersions | null;
    height: number;
    HTML: string;
    isDummySelector?: boolean;
    newEngine?: boolean;
    occurrences: number;
    offsetX: number;
    offsetXMobile?: number;
    offsetY: number;
    offsetYMobile?: number;
    screenshot?: null | string;
    selector: string;
    src: string;
    success: boolean;
    suggestionLabel: string;
    suggestionType: string;
    visible: boolean;
    width: number;
};
export type Severity = 'extreme' | 'high' | 'low' | 'medium';
export type ReportExportType = 'json';
export type SeverityCounts = Partial<Record<Severity, number>>;
export type DeviceInfo = {
    deviceType: 'desktop' | 'mobile';
};
export type RuleSummary = {
    description: string;
    name: string;
    numberOfOccurrences: number;
    selectorData?: {
        HTML: string;
        selector: string;
        suggestionLabel: string;
        suggestionType: string;
    }[];
    selectors: string[];
    severity: Severity;
    suggestedFix?: {
        HTML?: string;
        suggestionLabel?: string;
        suggestionType?: string;
    };
    WCAGLevel?: string;
    WCAGLink?: string;
    WCAGLinks?: string[];
};
export type AuditReport = {
    deviceInfo?: DeviceInfo;
    numberOfIssuesFound: SeverityCounts;
    ruleViolations: Record<string, RuleSummary>;
};
export type PlaywrightPage = {
    addInitScript: (arg: {
        content: string;
    }) => Promise<void>;
    addStyleTag: (arg: {
        content: string;
    }) => Promise<unknown>;
    evaluate: <R, Arg = unknown>(pageFunction: (arg: Arg) => Promise<R> | R, arg: Arg) => Promise<R>;
    goto: (url: string, options?: Record<string, unknown>) => Promise<null | Response>;
    url: () => string;
};
/**
 * Framework-agnostic browser driver interface.
 * Adapters for Playwright, Selenium, and Cypress will implement this interface.
 */
export type IBrowserDriver = {
    /**
     * Inject a JavaScript script that runs before any page scripts.
     * @param content The JavaScript code to inject
     */
    addInitScript: (content: string) => Promise<void>;
    /**
     * Inject a CSS stylesheet into the page.
     * @param content The CSS code to inject
     */
    addStyleTag: (content: string) => Promise<void>;
    /**
     * Execute JavaScript code in the browser context.
     * @param script The JavaScript code or function to execute
     * @param args Optional arguments to pass to the script
     */
    evaluate: <T>(script: ((...args: any[]) => T) | string, ...args: any[]) => Promise<T>;
    /**
     * Get the current page URL.
     * This method is async to support drivers like Selenium and Cypress
     * where URL retrieval is an asynchronous operation.
     */
    getUrl: () => Promise<string>;
};
declare global {
    interface Window {
        accessFlow?: {
            getLoadAudits: () => IAudits;
        };
    }
}
