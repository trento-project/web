export * from './base-po.js';
import * as basePage from './base-po.js';

// Test data
const sapSystemNwp = {
  sid: 'NWP',
  hostId: '9cd46919-5f19-59aa-993e-cf3736c71053',
};

// Selectors
const nwpSystemCell = `td:contains("${sapSystemNwp.sid}")`;

// Validations
export const nwpSystemShouldBeDisplayed = () =>
  cy.get(nwpSystemCell).should('be.visible');

export const nwpSystemShouldNotBeDisplayed = () =>
  cy.get(nwpSystemCell).should('not.exist');

// API
export const apiDeregisterSapSystemNwpHost = () =>
  basePage.apiDeregisterHost(sapSystemNwp.hostId);
