export * from './base-po.js';
import * as basePage from './base-po.js';

// Test Data
import {
  selectedDatabase,
  attachedHosts,
} from '../fixtures/hana-database-details/selected_database';

import { healthMap } from '../fixtures/sap-system-details/selected_system';

const url = '/databases';

// Selectors
const databaseNameLabel =
  'div[class*="grid-flow-row"]:contains("Name") div span';

const databaseTypeLabel =
  'div[class*="grid-flow-row"]:contains("Type") div span';

const pageNotFoundLabel = 'div:contains("Not Found")';

export const visitDatabase = () =>
  basePage.visit(`${url}/${selectedDatabase.Id}`);

export const visitNonExistentDatabase = () =>
  cy.visit(`${url}/other`, { failOnStatusCode: false });

// Validations
export const validatePageUrl = () =>
  basePage.validateUrl(`${url}/${selectedDatabase.Id}`);

export const validateNonExistentDatabaseUrl = () =>
  basePage.validateUrl(`${url}/other`);

export const databaseHasExpectedName = () =>
  cy.get(databaseNameLabel).should('have.text', selectedDatabase.Sid);

export const databaseHasExpectedType = () =>
  cy.get(databaseTypeLabel).should('have.text', selectedDatabase.Type);

export const pageNotFoundLabelIsDisplayed = () =>
  cy.get(pageNotFoundLabel).should('be.visible');

export const restoreDatabaseInstanceHealth = () =>
  basePage.loadScenario('hana-database-detail-GREEN');

const hostNameHasExpectedInstanceNumber = (hostName) => {
  const instanceNumber = getHostAttribute(hostName, 'Instance');
  cy.get(
    `div[class="mt-16"]:contains("Layout") td:contains("${hostName}") + td`
  ).should('have.text', instanceNumber);
};

const hostNameHasExpectedFeatures = (hostName) => {
  const features = getHostAttribute(hostName, 'Features');
  const formattedFeatures = features.replace(/\|/g, '');
  cy.get(
    `div[class="mt-16"]:contains("Layout") td:contains("${hostName}") + td + td`
  ).should('have.text', formattedFeatures);
};

const hostHasExpectedHttpPort = (hostName) => {
  const httpPort = getHostAttribute(hostName, 'HttpPort');
  cy.get(
    `div[class="mt-16"]:contains("Layout") td:contains("${hostName}") + td + td + td`
  ).should('have.text', httpPort);
};

const hostHasExpectedHttpsPort = (hostName) => {
  const httpsPort = getHostAttribute(hostName, 'HttpsPort');
  cy.get(
    `div[class="mt-16"]:contains("Layout") td:contains("${hostName}") + td + td + td + td`
  ).should('have.text', httpsPort);
};

const hostHasExpectedStartPriority = (hostName) => {
  const startPriority = getHostAttribute(hostName, 'StartPriority');
  cy.get(
    `div[class="mt-16"]:contains("Layout") td:contains("${hostName}") + td + td + td + td + td`
  ).should('have.text', startPriority);
};

const hostHasExpectedStatus = (hostName) => {
  const status = getHostAttribute(hostName, 'Status');
  cy.get(
    `div[class="mt-16"]:contains("Layout") td:contains("${hostName}") + td + td + td + td + td + td`
  ).should('have.text', `SAPControl: ${status}`);
};

const hostStatusHasExpectedClass = (hostName) => {
  const status = getHostAttribute(hostName, 'Status');
  cy.get(
    `div[class="mt-16"]:contains("Layout") td:contains("${hostName}") + td + td + td + td + td + td svg`
  ).should('have.class', healthMap[status]);
};

export const hostHasStatus = (status) =>
  cy
    .get(
      `div[class="mt-16"]:contains("Layout") td:contains("${selectedDatabase.Hosts[0].Hostname}") + td + td + td + td + td + td`
    )
    .should('have.text', `SAPControl: ${status}`);

export const hostHasClass = (status) =>
  cy
    .get(
      `div[class="mt-16"]:contains("Layout") td:contains("${selectedDatabase.Hosts[0].Hostname}") + td + td + td + td + td + td svg`
    )
    .should('have.class', healthMap[status]);

export const eachHostNameHasExpectedValues = () => {
  selectedDatabase.Hosts.forEach((host) => {
    const hostName = host.Hostname;
    hostNameHasExpectedInstanceNumber(hostName);
    hostNameHasExpectedFeatures(hostName);
    hostHasExpectedHttpPort(hostName);
    hostHasExpectedHttpsPort(hostName);
    hostHasExpectedStartPriority(hostName);
    hostHasExpectedStatus(hostName);
    hostStatusHasExpectedClass(hostName);
  });
};

function getHostAttribute(hostname, attribute) {
  const host = selectedDatabase.Hosts.find((h) => h.Hostname === hostname);
  return host ? host[attribute] : undefined;
}
