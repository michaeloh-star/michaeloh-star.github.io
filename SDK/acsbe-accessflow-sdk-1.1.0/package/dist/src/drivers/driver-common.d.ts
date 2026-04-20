/**
 * Shared helpers for browser driver adapters (Playwright, Selenium).
 * Keeps style-injection and evaluate argument handling in one place.
 */
/** ID of the injected auditor style tag; used for best-effort style injection in both drivers. */
export declare const AUDITOR_STYLE_TAG_ID = "accessflow-auditor-style";
/**
 * Returns the script body for Selenium executeScript that injects the auditor style tag.
 * Call as executeScript(getStyleInjectionScript(), css) — script reads arguments[0] for the CSS.
 * Best-effort: callers should catch and swallow errors (e.g. CSP) so ensureInit can use the evaluate fallback.
 */
export declare function getStyleInjectionScript(): string;
/**
 * Single argument to pass to evaluate when script is a function (aligns Playwright and Selenium).
 */
export declare function getEvaluateSingleArg(args: unknown[]): unknown;
/**
 * Serializes a function for Selenium executeScript: script runs in browser with one argument in arguments[0].
 */
export declare function getFunctionScriptString(fn: (...args: any[]) => unknown): string;
