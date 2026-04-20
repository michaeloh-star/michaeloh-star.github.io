/// <reference types="cypress" />
/**
 * Register AccessFlow Cypress tasks and after:run event handler
 * Call this in setupNodeEvents in cypress.config.ts
 *
 * @example
 * ```typescript
 * import { registerAccessFlowTasks } from '@acsbe/accessflow-sdk/cypress';
 *
 * export default defineConfig({
 *   e2e: {
 *     setupNodeEvents(on, config) {
 *       registerAccessFlowTasks(on, config);
 *     },
 *   },
 * });
 * ```
 */
export declare function registerAccessFlowTasks(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions): void;
