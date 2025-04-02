export * from './base_po.js';
import * as basePage from './base_po.js';

export const dashboardPageIsDisplayed = () =>
  basePage.pageTitleIsCorrectlyDisplayed('At a glance');

export const loadingMessageIsDisplayed = () =>
  cy.get('h2').should('have.text', 'Loading...');
