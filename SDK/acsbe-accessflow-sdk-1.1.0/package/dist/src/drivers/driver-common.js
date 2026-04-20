"use strict";
/**
 * Shared helpers for browser driver adapters (Playwright, Selenium).
 * Keeps style-injection and evaluate argument handling in one place.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunctionScriptString = exports.getEvaluateSingleArg = exports.getStyleInjectionScript = exports.AUDITOR_STYLE_TAG_ID = void 0;
/** ID of the injected auditor style tag; used for best-effort style injection in both drivers. */
exports.AUDITOR_STYLE_TAG_ID = 'accessflow-auditor-style';
/**
 * Returns the script body for Selenium executeScript that injects the auditor style tag.
 * Call as executeScript(getStyleInjectionScript(), css) — script reads arguments[0] for the CSS.
 * Best-effort: callers should catch and swallow errors (e.g. CSP) so ensureInit can use the evaluate fallback.
 */
function getStyleInjectionScript() {
    return `
    if (!document.getElementById('${exports.AUDITOR_STYLE_TAG_ID}')) {
      const styleTag = document.createElement('style');
      styleTag.id = '${exports.AUDITOR_STYLE_TAG_ID}';
      styleTag.textContent = arguments[0];
      document.head.appendChild(styleTag);
    }
  `;
}
exports.getStyleInjectionScript = getStyleInjectionScript;
/**
 * Single argument to pass to evaluate when script is a function (aligns Playwright and Selenium).
 */
function getEvaluateSingleArg(args) {
    return args.length > 0 ? args[0] : undefined;
}
exports.getEvaluateSingleArg = getEvaluateSingleArg;
/**
 * Serializes a function for Selenium executeScript: script runs in browser with one argument in arguments[0].
 */
function getFunctionScriptString(fn) {
    return `return (${fn.toString()}).apply(null, arguments)`;
}
exports.getFunctionScriptString = getFunctionScriptString;
