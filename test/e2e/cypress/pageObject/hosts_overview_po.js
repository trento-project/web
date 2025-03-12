export * from './base_po';
import * as basePage from './base_po';

import { capitalize } from 'lodash';

// Test data
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
