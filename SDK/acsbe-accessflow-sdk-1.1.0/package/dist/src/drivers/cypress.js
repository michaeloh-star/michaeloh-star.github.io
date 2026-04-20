"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CypressDriver = void 0;
/**
 * Cypress adapter that implements the IBrowserDriver interface.
 * This is a skeleton implementation that will be completed when Cypress support is added.
 *
 * Note: Cypress has a fundamentally different execution model (commands are queued).
 * This adapter will need special handling to work with Cypress's async command chain.
 *
 * Usage example (future):
 * ```typescript
 * const accessFlowDriver = new CypressDriver();
 * const sdk = new AccessFlowSDK(accessFlowDriver);
 * ```
 */
class CypressDriver {
    constructor() {
        // Cypress uses global cy object
    }
    async addInitScript(content) {
        // Cypress can inject scripts via cy.task or by modifying the HTML before load
        throw new Error('CypressDriver: addInitScript not yet implemented');
    }
    async addStyleTag(content) {
        // Cypress uses cy.document() and cy.get() to manipulate DOM
        throw new Error('CypressDriver: addStyleTag not yet implemented');
    }
    async evaluate(script, ...args) {
        // Cypress uses cy.window() and cy.then() for evaluation
        throw new Error('CypressDriver: evaluate not yet implemented');
    }
    async getUrl() {
        // Cypress uses cy.url() which returns a Chainable
        // This will need proper implementation when Cypress support is added
        throw new Error('CypressDriver: getUrl not yet implemented');
    }
}
exports.CypressDriver = CypressDriver;
