export * from './base-po.js';
import * as basePage from './base-po.js';

const activityLogEndpointAlias = 'activityLogRequest';

//Selectors
const filteringElements = 'div[class="relative"]';
const refreshRateFilter = 'button[class*="refresh-rate"] ';
const metadataSearchInput = 'input[name="metadata-search"]';

const filterOlderThanButton = 'button:contains("Filter older than...")';
const filterOlderThanInputField = `${filterOlderThanButton} + div input`;

const filterNewerThanButton = 'button:contains("Filter newer than...")';
const filterNewerThanInputField = `${filterNewerThanButton} + div input`;

const filterTypeButton = 'button:contains("Filter Type")';

const applyFiltersButton = 'button:contains("Apply Filters")';
const resetFiltersButton = 'button:contains("Reset Filters")';
const refreshButton = 'button:contains("Refresh")';

export const visit = (queryString = '') => {
  return basePage.visit(`/activity_log${queryString}`);
};

export const clickFilterTypeButton = () => {
  return cy.get(filterTypeButton).click();
};

export const selectFilterTypeOption = (option) => {
  return cy.get(`span:contains("${option}")`).click();
};

export const clickFilterNewerThanButton = () => {
  return cy.get(filterNewerThanButton).click();
};

export const typeFilterNewerThanInputField = (filterValue) => {
  return cy.get(filterNewerThanInputField).type(filterValue);
};

export const clickFilterOlderThanButton = () => {
  return cy.get(filterOlderThanButton).click();
};

export const typeFilterOlderThanInputField = (filterValue) => {
  return cy.get(filterOlderThanInputField).type(filterValue);
};

export const clickRefreshButton = () => {
  return cy.get(refreshButton).click();
};

export const clickApplyFiltersButton = () => {
  return cy.get(applyFiltersButton).click();
};

export const clickResetFiltersButton = () => {
  return cy.get(resetFiltersButton).click();
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

export const filterOlderThanHasTheExpectedValue = (filterValue) => {
  return cy
    .get(filteringElements)
    .eq(3)
    .find('span span')
    .should('have.text', filterValue);
};

export const filterNewerThanHasTheExpectedValue = (filterValue) => {
  return cy
    .get(filteringElements)
    .eq(2)
    .find('span span')
    .should('have.text', filterValue);
};

export const filterNewerThanHasNothingSelected = () => {
  return filterNewerThanHasTheExpectedValue('Filter newer than...');
};

export const filterOlderThanHasNothingSelected = () => {
  return filterOlderThanHasTheExpectedValue('Filter older than...');
};

export const filterTypeHasNothingSelected = () => {
  return filteredActionsAreTheExpectedOnes('Filter Type...');
};

export const refreshRateFilterHasTheExpectedValue = (refreshRate) => {
  return cy.get(refreshRateFilter).should('have.text', refreshRate);
};

export const metadataSearchHasTheExpectedPlaceholder = () => {
  return cy
    .get(metadataSearchInput)
    .should('have.attr', 'placeholder', 'Filter by metadata')
    .should('be.visible');
};

export const metadataSearchHasTheExpectedValue = (searchValue) => {
  return cy.get(metadataSearchInput).should('have.value', searchValue);
};

export const typeMetadataFilter = (searchValue) => {
  return cy.get(metadataSearchInput).type(searchValue);
};

export const waitForActivityLogRequest = () => {
  return cy.wait(`@${activityLogEndpointAlias}`);
};

export const activityLogRequestHasExpectedStatusCode = (statusCode) => {
  return basePage.validateResponseStatusCode(
    activityLogEndpointAlias,
    statusCode
  );
};
