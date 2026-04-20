"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeAudits = void 0;
const rules_json_1 = __importDefault(require("../../assets/rules.json"));
/**
 * Summarize audit results by counting issues by severity and creating rule summaries.
 * This is the core business logic extracted for use in both SDK and CLI.
 */
function summarizeAudits(audits) {
    var _a, _b;
    const severityCounts = {};
    const ruleSummaries = {};
    const auditsArray = Array.isArray(audits) ? audits : [audits];
    for (const auditorResults of auditsArray) {
        for (const shortCode in auditorResults) {
            const audit = auditorResults[shortCode];
            if (!audit || audit.success)
                continue;
            const rule = rules_json_1.default.find((r) => r.shortCode === shortCode);
            if (!rule)
                continue;
            const severity = rule.severity.toLowerCase();
            let occurrences = 0;
            const selectorSet = new Set();
            const selectors = [];
            // Track HTML, suggestionLabel, and suggestionType per selector (backend creates one issue per unique selector)
            const selectorDataMap = new Map();
            for (const issue in audit) {
                const report = audit[issue];
                if (!report.success) {
                    occurrences += 1;
                    // Track unique selectors (backend creates one issue per unique selector)
                    if (!selectorSet.has(report.selector)) {
                        selectorSet.add(report.selector);
                        selectors.push(report.selector);
                        // Store HTML and suggestion data for this selector (use first occurrence's data)
                        selectorDataMap.set(report.selector, {
                            HTML: report.HTML || '',
                            suggestionLabel: report.suggestionLabel || '',
                            suggestionType: report.suggestionType || '',
                        });
                    }
                }
            }
            if (occurrences > 0) {
                // Count unique selectors (one issue per selector in the backend)
                const uniqueSelectorCount = selectorSet.size;
                // Build selector-specific data array for backend processing
                // The backend creates one issue per selector, so we need HTML per selector
                const selectorDataArray = selectors.map((selector) => {
                    const data = selectorDataMap.get(selector) || { HTML: '', suggestionLabel: '', suggestionType: '' };
                    return {
                        HTML: data.HTML,
                        selector,
                        suggestionLabel: data.suggestionLabel,
                        suggestionType: data.suggestionType,
                    };
                });
                // Get HTML and suggestion data from first selector for backward compatibility
                const firstSelectorData = selectorDataMap.get(selectors[0]) || {
                    HTML: '',
                    suggestionLabel: '',
                    suggestionType: '',
                };
                ruleSummaries[rule.shortCode] = {
                    name: rule.name,
                    numberOfOccurrences: occurrences,
                    severity,
                    ...(rule.WCAGLevel && rule.WCAGLevel !== 'none' ? { WCAGLevel: rule.WCAGLevel } : {}),
                    description: rule.shortDescription,
                    selectors,
                    WCAGLink: (_a = rule.issueWCAGLinks) === null || _a === void 0 ? void 0 : _a[0],
                    ...(((_b = rule.issueWCAGLinks) === null || _b === void 0 ? void 0 : _b.length) ? { WCAGLinks: rule.issueWCAGLinks } : {}),
                    // Include suggestedFix data if available (using first selector for backward compatibility)
                    ...(firstSelectorData.HTML || firstSelectorData.suggestionLabel ?
                        {
                            suggestedFix: {
                                HTML: firstSelectorData.HTML,
                                suggestionLabel: firstSelectorData.suggestionLabel,
                                suggestionType: firstSelectorData.suggestionType,
                            },
                        }
                        : {}),
                    // Include selector-specific data for backend processing
                    // This allows the backend to get HTML per selector when creating cicd issues
                    selectorData: selectorDataArray,
                };
                // Count unique selectors, not occurrences (backend creates one issue per unique selector)
                severityCounts[severity] = (severityCounts[severity] || 0) + uniqueSelectorCount;
            }
        }
    }
    // Order severity counts
    const orderedSeverityCounts = {};
    for (const sev of ['extreme', 'high', 'medium', 'low']) {
        if (typeof severityCounts[sev] !== 'undefined') {
            orderedSeverityCounts[sev] = severityCounts[sev];
        }
    }
    return { orderedSeverityCounts, ruleSummaries };
}
exports.summarizeAudits = summarizeAudits;
