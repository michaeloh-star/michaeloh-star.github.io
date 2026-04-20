"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAccessFlowTasks = void 0;
var plugin_1 = require("./plugin");
Object.defineProperty(exports, "registerAccessFlowTasks", { enumerable: true, get: function () { return plugin_1.registerAccessFlowTasks; } });
