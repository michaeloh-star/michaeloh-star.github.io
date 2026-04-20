"use strict";
/**
 * Cypress custom commands for AccessFlow SDK
 * Import this in cypress/support/e2e.ts:
 *
 * import '@acsbe/accessflow-sdk/cypress/support';
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Cached auditor assets (loaded once via accessflow:init task)
 */
let cachedAssets = null;
/**
 * cy.accessFlowAudit() - Run accessibility audit on current page
 *
 * Injects the AccessFlow auditor into the page, runs the audit, and returns
 * a structured report. Automatically records the audit for aggregation.
 *
 * @example
 * ```typescript
 * cy.visit('/page');
 * cy.accessFlowAudit().then((report) => {
 *   expect(report.numberOfIssuesFound.extreme).to.equal(0);
 * });
 * ```
 */
Cypress.Commands.add('accessFlowAudit', () => {
    // Load assets once (cached in Node-side plugin)
    return cy
        .task('accessflow:init')
        .then((assets) => {
        cachedAssets = assets;
        // Inject auditor script into page
        return cy.window().then((win) => {
            const doc = win.document;
            // Inject script (idempotent - checks for window.accessFlow)
            if (!win.accessFlow) {
                const scriptTag = doc.createElement('script');
                scriptTag.textContent = assets.auditorJs;
                doc.documentElement.appendChild(scriptTag);
            }
            // Inject CSS (idempotent - checks for existing style tag)
            if (!doc.getElementById('accessflow-auditor-style')) {
                const styleTag = doc.createElement('style');
                styleTag.id = 'accessflow-auditor-style';
                styleTag.textContent = assets.auditorCss;
                doc.head.appendChild(styleTag);
            }
        });
    })
        .then(() => {
        // Run audit and get raw results
        return cy.window().then((win) => {
            if (!win.accessFlow || !win.accessFlow.getLoadAudits) {
                throw new Error('[AccessFlowSDK] Auditor not loaded. window.accessFlow.getLoadAudits is undefined.');
            }
            const rawAudits = win.accessFlow.getLoadAudits();
            return { rawAudits, url: win.location.href };
        });
    })
        .then(({ rawAudits, url }) => {
        // Record audit for aggregation (non-blocking)
        cy.task('accessflow:record', { audit: rawAudits, url });
        // Process audit and return report
        return cy.task('accessflow:process', { rawAudits, url });
    });
});
