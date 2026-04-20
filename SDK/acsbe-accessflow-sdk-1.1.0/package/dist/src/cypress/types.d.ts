/**
 * TypeScript type augmentations for Cypress custom commands
 * These types are automatically available when importing the support file
 */
import type { AuditReport } from '../types';
declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Run AccessFlow accessibility audit on the current page
       *
       * @example
       * ```typescript
       * cy.visit('/page');
       * cy.accessFlowAudit().then((report) => {
       *   expect(report.numberOfIssuesFound.extreme).to.equal(0);
       *   expect(report.numberOfIssuesFound.high).to.be.lessThan(5);
       * });
       * ```
       */
      accessFlowAudit(): Chainable<AuditReport>;
    }
  }
}
export {};
