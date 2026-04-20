/**
 * AccessFlow SDK Cypress Plugin
 *
 * @example
 * ```typescript
 * // cypress.config.ts
 * import { defineConfig } from 'cypress';
 * import { registerAccessFlowTasks } from '@acsbe/accessflow-sdk/cypress';
 *
 * export default defineConfig({
 *   e2e: {
 *     setupNodeEvents(on, config) {
 *       registerAccessFlowTasks(on, config);
 *     },
 *   },
 * });
 *
 * // cypress/support/e2e.ts
 * import '@acsbe/accessflow-sdk/cypress/support';
 *
 * // In tests:
 * cy.visit('/page');
 * cy.accessFlowAudit().then((report) => {
 *   expect(report.numberOfIssuesFound.extreme).to.equal(0);
 * });
 * ```
 */
export { registerAccessFlowTasks } from './plugin';
export type {} from './types';
