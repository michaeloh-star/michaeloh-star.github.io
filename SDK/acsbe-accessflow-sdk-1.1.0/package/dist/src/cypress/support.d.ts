/**
 * Cypress custom commands for AccessFlow SDK
 * Import this in cypress/support/e2e.ts:
 *
 * import '@acsbe/accessflow-sdk/cypress/support';
 */
import type { IAudits } from '../types';
declare global {
  interface Window {
    accessFlow?: {
      getLoadAudits: () => IAudits;
    };
  }
}
