export * from './base-po.js';
import * as basePage from './base-po.js';

const activityLogEndpointAlias = 'activityLogRequest';

//Selectors
const filteringElements = 'div[class="relative"]';
const refreshRateFilter = 'button[class*="refresh-rate"] ';

export const visit = () => {
  return basePage.visit('/activity_log');
};

export const visitWithQueryString = () => {
  const urlWithQueryString =
    '/activity_log?search=foo+bar&from_date=custom&from_date=2024-08-14T10%3A21%3A00.000Z&to_date=custom&to_date=2024-08-13T10%3A21%3A00.000Z&type=login_attempt&type=resource_tagging&refreshRate=5000';
  return basePage.visit(urlWithQueryString);
};

export const interceptActivityLogEndpoint = () => {
  return cy
    .intercept({
      url: '/api/v1/activity_log*',
    })
    .as(activityLogEndpointAlias);
};

export const activityLogEndpointIsCalledOnlyOnce = () => {
  cy.wait(`@${activityLogEndpointAlias}`);
  return cy.get(`@${activityLogEndpointAlias}.all`).should('have.length', 1);
};

export const filteredActionsAreTheExpectedOnes = (filteredActions) => {
  return cy
    .get(filteringElements)
    .eq(0)
    .find('span span')
    .should('have.text', filteredActions);
};

export const refreshRateFilterHasTheExpectedValue = (refreshRate) => {
  return cy.get(refreshRateFilter).should('have.text', refreshRate);
};
