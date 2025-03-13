export * from './base_po';
import * as basePage from './base_po';

import { capitalize } from 'lodash';

// Test data
const saptuneScenarios = [
  {
    scenario: 'not-compliant',
    icon: 'fill-red-500',
  },
  {
    scenario: 'not-tuned',
    icon: 'fill-yellow-500',
  },
  {
    scenario: 'compliant',
    icon: 'fill-jungle-green-500',
  },
];

const hostWithoutSap = 'vmdrbddev01';
const hostWithSap = 'vmhdbprd01';

import {
  availableHosts,
  agents,
} from '../fixtures/hosts-overview/available_hosts';

const url = '/hosts';

// Selectors

const hostNameCell = '.tn-hostname';
const currentPaginationDetails =
  'div[data-testid="pagination"] span:contains("Showing")';
const nextPageSelector = '[aria-label="next-page"]';

const hostsWithWarning = 'p:contains("Warning") + p';
const hostsWithCritical = 'p:contains("Critical") + p';
const hostsWithPassing = 'p:contains("Passing") + p';

const passingHostBadge = 'svg.fill-jungle-green-500';
const warningHostBadge = 'svg.fill-yellow-500';
const criticalHostBadge = 'svg.fill-red-500';

// UI Interactions

export const visit = () => basePage.visit(url);

export const validateUrl = () => basePage.validateUrl(url);

export const clickNextPageButton = () => cy.get(nextPageSelector).click();

// UI Validations

export const hostsIsHighglightedInSidebar = () => {
  cy.get(basePage.navigation.hosts).should('have.attr', 'aria-current', 'page');
};

export const tenHostsAreListed = () => {
  cy.get(hostNameCell).should('have.length', 10);
};

export const expectedPaginationIsDisplayed = (expectedPaginationDetails) =>
  cy
    .get(currentPaginationDetails)
    .should('have.text', expectedPaginationDetails);

export const nextPageButtonIsDisabled = () =>
  cy.get(nextPageSelector).should('be.disabled');

export const everyLinkGoesToExpectedHostDetailsPage = () => {
  availableHosts.slice(0, 10).forEach((host) => {
    cy.get(`a[href*="${host.id}"]`).click();
    basePage.validateUrl(`${url}/${host.id}`);
    cy.go('back');
  });
};

export const everyClusterLinkGoesToExpectedClusterDetailsPage = () => {
  availableHosts.slice(0, 10).forEach((host, index) => {
    cy.get('thead th:contains("Cluster")')
      .invoke('index')
      .then((i) => {
        if (host.clusterId !== '') {
          cy.get('tbody tr').eq(index).find('td').eq(i).click();
          basePage.validateUrl(`/clusters/${host.clusterId}`);
          cy.go('back');
        }
      });
  });
};

export const everySapSystemLinkGoesToExpectedSapSystemDetailsPage = () => {
  availableHosts.slice(0, 10).forEach((host, index) => {
    cy.get('thead th:contains("SID")')
      .invoke('index')
      .then((i) => {
        if (host.sapSystemSid !== '') {
          cy.get(`td:contains("${host.sapSystemSid}")`).should('be.visible');
          cy.get('tbody tr').eq(index).find('td').eq(i).click();
          basePage.validateUrl(`/databases/${host.sapSystemId}`);
          cy.go('back');
        }
      });
  });
};

export const expectedWarningHostsAreDisplayed = (amount) =>
  cy.get(hostsWithWarning).should('have.text', amount);

export const expectedCriticalHostsAreDisplayed = (amount) =>
  cy.get(hostsWithCritical, { timeout: 20000 }).should('have.text', amount);

export const expectedPassingHostsAreDisplayed = (amount) =>
  cy.get(hostsWithPassing).should('have.text', amount);

export const expectedAmountOfWarningsIsDisplayed = (amount) =>
  cy.get(warningHostBadge).should('have.length', amount);

export const expectedAmountOfCriticalsIsDisplayed = (amount) => {
  if (amount === 0) cy.get(criticalHostBadge).should('not.exist');
  else {
    cy.get(criticalHostBadge, { timeout: 20000 }).should('have.length', amount);
  }
};

export const expectedAmountOfPassingIsDisplayed = (amount) =>
  cy.get(passingHostBadge).should('have.length', amount);

const _hostHasExpectedStatus = (host, status) =>
  cy
    .get(`tr:contains("${host}") td:nth-child(1) svg`)
    .should('have.class', status);

export const hostWithSapHasExpectedStatus = () =>
  _hostHasExpectedStatus(hostWithoutSap, 'fill-jungle-green-500');

export const hostWithoutSapHasExpectedStatus = () =>
  _hostHasExpectedStatus(hostWithSap, 'fill-yellow-500');

export const hostWithSaptuneNotCompliantHasExpectedStatus = () =>
  _hostHasExpectedStatus(hostWithSap, 'fill-red-500');

export const hostWithSaptuneNotTunedHasExpectedStatus = () =>
  _hostHasExpectedStatus(hostWithSap, 'fill-yellow-500');

export const hostWithSaptuneCompliantHasExpectedStatus = () =>
  _hostHasExpectedStatus(hostWithSap, 'fill-jungle-green-500');

// Table Validation

export const hostsTableContentsAreTheExpected = () => {
  const expectedValuesArray = availableHosts.slice(0, 10);
  expectedValuesArray.forEach((rowExpectedValues, rowIndex) => {
    _getTableHeaders().then((headers) => {
      headers.slice(3, 7).forEach((header) => {
        const attributeName = _processAttributeName(header);
        let expectedValue = rowExpectedValues[attributeName];
        _validateCell(header, rowIndex, expectedValue);
      });
    });
  });
};

const _getTableHeaders = () => {
  return cy.get('thead th').then((headers) => {
    const headerTexts = [...headers].map((header) => header.textContent.trim());
    return cy.wrap(headerTexts);
  });
};

const _processAttributeName = (attributeHeaderName) => {
  const splittedAttribute = attributeHeaderName.toLowerCase().split(' ');
  if (splittedAttribute.length === 2)
    return splittedAttribute[0] + capitalize(splittedAttribute[1]);
  else if (splittedAttribute[0] === 'ip') return 'ipAddresses';
  else if (splittedAttribute[0] === 'cluster') return 'clusterName';
  else if (splittedAttribute[0] === 'sid') return 'sapSystemSid';
  else return splittedAttribute;
};

const _validateCell = (header, rowIndex, expectedValue) => {
  const tableHeaderSelector = `thead th:contains("${header}")`;
  const tableRowSelector = `tbody tr`;

  cy.get(tableHeaderSelector)
    .invoke('index')
    .then((i) => {
      const isPropertyArray = Array.isArray(expectedValue);
      if (isPropertyArray) {
        cy.wrap(expectedValue).each((value) => {
          cy.get(tableRowSelector)
            .eq(rowIndex)
            .find('td')
            .eq(i)
            .should('contain', value);
        });
      } else {
        cy.get(tableRowSelector)
          .eq(rowIndex)
          .find('td')
          .eq(i)
          .should('contain', expectedValue);
      }
    });
};

// API
export const startAgentsHeartbeat = () =>
  cy.task('startAgentHeartbeat', agents());

export const loadHostWithoutSaptune = () =>
  basePage.loadScenario(`host-${hostWithoutSap}-saptune-uninstalled`);

export const loadHostWithSaptuneNotTuned = () =>
  basePage.loadScenario(`host-${hostWithoutSap}-saptune-not-tuned`);

export const loadHostWithSapWithoutSaptune = () =>
  basePage.loadScenario(`host-${hostWithSap}-saptune-uninstalled`);

export const loadHostWithSapWithSaptuneUnsupported = () =>
  basePage.loadScenario(`host-${hostWithSap}-saptune-unsupported`);

export const loadHostWithSaptuneScenario = (scenario) =>
  basePage.loadScenario(`host-${hostWithSap}-saptune-${scenario}`);
