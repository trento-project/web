export * from './base_po';
import * as basePage from './base_po';

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

const applyFiltersButton = 'button:contains("Apply Filter")';
const resetFiltersButton = 'button:contains("Reset Filters")';
const refreshButton = 'button:contains("Refresh")';

const nextPageButton = '[aria-label="next-page"]';
const previousPageButton = '[aria-label="prev-page"]';
const firstPageButton = '[aria-label="first-page"]';
const lastPageButton = '[aria-label="last-page"]';

const selectPaginationButton =
  'div[class*="flex justify-between"] button[aria-haspopup="listbox"]';

const autoRefreshIntervalButton = 'button[class*="refresh-rate"]';
const availableRefreshRates = 'button[class*="refresh-rate"] + div div';

//Test data
const expectedRefreshRates = ['Off', '5s', '10s', '30s', '1m', '5m', '30m'];

export const visit = (queryString = '') =>
  basePage.visit(`/activity_log${queryString}`);

// Network Interception

export const interceptActivityLogEndpoint = () => {
  return cy
    .intercept({
      url: '/api/v1/activity_log*',
    })
    .as(activityLogEndpointAlias);
};

export const spyActivityLogRequest = () => {
  cy.clock();
  return cy.intercept(
    '/api/v1/activity_log*',
    cy.spy().as(activityLogEndpointAlias)
  );
};

export const waitForActivityLogRequest = () =>
  basePage.waitForRequest(activityLogEndpointAlias);

// UI Interactions
export const clickFilterTypeButton = () =>
  cy.get(filterTypeButton).click({ force: true });

export const clickAutoRefreshRateButton = () => {
  cy.get(autoRefreshIntervalButton).click();
  cy.get('div[role="option"]').should('have.length', 7);
};

export const clickFilterNewerThanButton = () =>
  cy.get(filterNewerThanButton).click();

export const clickFilterOlderThanButton = () =>
  cy.get(filterOlderThanButton).click();

export const clickRefreshButton = () =>
  cy.get(refreshButton).click({ force: true });

export const clickApplyFiltersButton = () => cy.get(applyFiltersButton).click();

export const clickResetFiltersButton = () => cy.get(resetFiltersButton).click();

export const clickNextPageButton = () => cy.get(nextPageButton).click();

export const clickPreviousPageButton = () => cy.get(previousPageButton).click();

export const clickFirstPageButton = () => cy.get(firstPageButton).click();

export const clickLastPageButton = () => cy.get(lastPageButton).click();

export const typeFilterNewerThanInputField = (filterValue) =>
  cy.get(filterNewerThanInputField).type(filterValue);

export const typeFilterOlderThanInputField = (filterValue) =>
  cy.get(filterOlderThanInputField).type(filterValue);

export const selectFilterTypeOption = (option) =>
  cy.get(`span:contains("${option}")`).click();

export const typeMetadataFilter = (searchValue) =>
  cy.get(metadataSearchInput).type(searchValue);

export const selectPagination = (amountOfItems) => {
  cy.get(selectPaginationButton).click();
  return cy.get(`span:contains("${amountOfItems}")`).first().click();
};

export const selectRefreshRate = (refreshRate) => {
  clickAutoRefreshRateButton();
  return cy.contains(refreshRate).click();
};

// UI Validations

export const autoRefreshIntervalButtonHasTheExpectedValue = (refreshRate) =>
  cy.get(autoRefreshIntervalButton).should('have.text', refreshRate);

export const autoRefreshButtonIsEnabled = () =>
  cy.get(autoRefreshIntervalButton).should('be.enabled');

export const autoRefreshIntervalButtonIsDisabled = () =>
  cy.get(autoRefreshIntervalButton).should('be.disabled');

export const filteredActionsAreTheExpectedOnes = (filteredActions) => {
  return cy
    .get(filteringElements)
    .eq(1)
    .find('span span')
    .should('have.text', filteredActions);
};

export const filterNewerThanHasTheExpectedValue = (filterValue) => {
  let expectedValue;
  _isUriComponentDate(filterValue)
    ? (expectedValue = formatEncodedDate(filterValue))
    : (expectedValue = filterValue);

  return cy
    .get(filteringElements)
    .eq(3)
    .find('span span')
    .should('have.text', expectedValue);
};

export const filterOlderThanHasTheExpectedValue = (filterValue) => {
  let expectedValue;
  _isUriComponentDate(filterValue)
    ? (expectedValue = formatEncodedDate(filterValue))
    : (expectedValue = filterValue);
  return cy
    .get(filteringElements)
    .eq(4)
    .find('span span')
    .should('have.text', expectedValue);
};

export const filterNewerThanHasNothingSelected = () =>
  filterNewerThanHasTheExpectedValue('Filter newer than...');

export const filterOlderThanHasNothingSelected = () =>
  filterOlderThanHasTheExpectedValue('Filter older than...');

export const filterTypeHasNothingSelected = () =>
  filteredActionsAreTheExpectedOnes('Filter Type...');

export const refreshRateFilterHasTheExpectedValue = (refreshRate) =>
  cy.get(refreshRateFilter).should('have.text', refreshRate);

export const metadataSearchHasTheExpectedPlaceholder = () => {
  return cy
    .get(metadataSearchInput)
    .should('have.attr', 'placeholder', 'Filter by metadata')
    .should('be.visible');
};

export const metadataSearchHasTheExpectedValue = (searchValue) =>
  cy.get(metadataSearchInput).should('have.value', searchValue);

export const selectPaginationButtonHasTheExpectedValue = (pagination) =>
  cy.get(selectPaginationButton).should('have.text', pagination);

// Response Validations
export const activityLogEndpointIsCalledOnlyOnce = () => {
  waitForActivityLogRequest();
  return cy.get(`@${activityLogEndpointAlias}.all`).should('have.length', 1);
};

export const activityLogRequestHasExpectedStatusCode = (statusCode) => {
  return basePage.validateResponseStatusCode(
    activityLogEndpointAlias,
    statusCode
  );
};

export const paginationPropertiesAreTheExpected = (response) => {
  expect(response.body).to.have.property('pagination');
  expect(response.body.pagination).to.have.property('end_cursor');
  expect(response.body.pagination.end_cursor).not.to.be.undefined;
  expect(response.body.pagination.has_next_page).to.be.true;
  expect(response.body.pagination).to.have.property('first', 20);
};

export const validateResponsePagination = (amountOfItems) => {
  return basePage
    .waitForRequest(activityLogEndpointAlias)
    .its('response.body.pagination.first')
    .should('eq', amountOfItems);
};

export const responseMatchesFirstPageContent = (expectedResponse) => {
  waitForActivityLogRequest().then(({ response }) => {
    expect(response.body.pagination).to.have.property('last', 20);
    expectedResponse.body.data.forEach((element, i) => {
      expect(element.id).to.eq(response.body.data[i].id);
    });
  });
};

export const apiCallDoesNotContainRefreshRate = (refreshRate) => {
  return waitForActivityLogRequest().then(({ response }) => {
    expect(response.url).to.not.contain(refreshRate);
  });
};

export const expectedRefreshRatesAreAvailable = () => {
  clickAutoRefreshRateButton();
  cy.get(availableRefreshRates).each(($element, index) =>
    expect(expectedRefreshRates[index]).to.eq($element.text())
  );
  return clickAutoRefreshRateButton();
};

export const expectedAggregateAmountOfRequests = (amount) =>
  cy.get('@activityLogRequest').its('callCount').should('equal', amount);

//Helpers

export const formatEncodedDate = (encodedDate) => {
  const decodedDate = decodeURIComponent(encodedDate);
  const date = new Date(decodedDate);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const year = date.getUTCFullYear();
  let hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
};

const _isUriComponentDate = (encodedDate) => {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}%3A\d{2}%3A\d{2}\.\d{3}Z$/;
  return regex.test(encodedDate);
};

export const buildChangingRefreshRateScenarios = () => {
  const timeUnits = { s: 1000, m: 60000 };
  return expectedRefreshRates.map((current, index) => {
    const next =
      expectedRefreshRates[(index + 1) % expectedRefreshRates.length];
    const expectedRefreshRate =
      next === expectedRefreshRates[0]
        ? null
        : parseInt(next) * timeUnits[next.slice(-1)];

    return {
      currentRefreshRate: current,
      newRefreshRate: next,
      expectedRefreshRate,
    };
  });
};

export const advanceTimeBy = (timeInSeconds) => cy.tick(timeInSeconds * 1000);

export const formatEncodedDateForQueryString = (dateString) => {
  const [datePart, timePart] = dateString.split('T');
  const newDateString = `${datePart}T00:00:00.000Z`;
  const date = new Date(newDateString);
  const [hours, minutes] = timePart.split(':');
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}%3A${minutes}%3A00.000Z`;
};
