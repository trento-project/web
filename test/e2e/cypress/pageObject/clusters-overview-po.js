import { createUserRequestFactory } from '@lib/test-utils/factories';
import {
  availableClusters,
  healthyClusterScenario,
  unhealthyClusterScenario,
} from '../fixtures/clusters-overview/available_clusters';

export * from './base-po.js';
import * as basePage from './base-po.js';

const url = '/clusters';
const clustersEndpoint = '/api/v2/clusters';
const clustersEndpointAlias = 'clustersEndpoint';

//Selectors
const clusterNames = '.tn-clustername';
const paginationNavigationButtons = 'div[class*="bg-gray-50"] ul button';
const tableRows = 'tbody tr';

export const visit = () => basePage.visit(url);

export const validateUrl = () => basePage.validateUrl(url);

export const interceptClustersEndpoint = () => {
  cy.intercept(clustersEndpoint).as(clustersEndpointAlias);
};

export const waitForClustersEndpoint = () => {
  return basePage.waitForRequest(clustersEndpointAlias);
};

export const allRegisteredClustersAreDisplayed = () => {
  cy.get(clusterNames).its('length').should('eq', availableClusters.length);
};

export const paginationButtonsAreDisabled = () => {
  cy.get(paginationNavigationButtons).should('be.disabled');
};

export const clustersDataIsDisplayedAsExpected = () => {
  return waitForClustersEndpoint().then(() => {
    return cy.get(tableRows).each(($row, index) => {
      const cluster = availableClusters[index];
      cy.wrap($row).find('td').eq(1).should('have.text', cluster.name);
      cy.wrap($row).find('td').eq(2).should('have.text', cluster.sid);
      return cy.wrap($row).find('td').eq(5).should('have.text', cluster.type);
    });
  });
};
