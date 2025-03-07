export * from './base_po';
import * as basePage from './base_po';

// Test Data
import {
  selectedDatabase,
  attachedHosts,
} from '../fixtures/hana-database-details/selected_database.js';

import { healthMap } from '../fixtures/sap-system-details/selected_system.js';

const url = '/databases';

// Selectors
const databaseNameLabel =
  'div[class*="grid-flow-row"]:contains("Name") div span';
const databaseTypeLabel =
  'div[class*="grid-flow-row"]:contains("Type") div span';
const pageNotFoundLabel = 'div:contains("Not Found")';
const attachedHostsTableRows = 'div[class="mt-16"]:contains("Layout") tbody tr';
const newRegisteredHost = `div[class="mt-8"]:contains("Hosts") td:contains("${attachedHosts[0].Name}")`;
const layoutTableHostNameCell = (hostName) =>
  `div[class="mt-16"]:contains("Layout") td:contains("${hostName}")`;
const hostsTableHostNameCell = (hostName) =>
  `div[class="mt-8"]:contains("Hosts") td:contains("${hostName}")`;

//UI Interactions

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

const hostNameHasExpectedInstanceNumber = (hostName) => {
  const instanceNumber = getHostAttribute(hostName, 'Instance');
  const hostNameCellSelector = layoutTableHostNameCell(hostName);
  cy.get(hostNameCellSelector).next().should('have.text', instanceNumber);
};

const hostNameHasExpectedFeatures = (hostName) => {
  const features = getHostAttribute(hostName, 'Features');
  const formattedFeatures = features.replace(/\|/g, '');
  const hostNameCellSelector = layoutTableHostNameCell(hostName);
  cy.get(hostNameCellSelector)
    .nextAll()
    .eq(1)
    .should('have.text', formattedFeatures);
};

const hostHasExpectedHttpPort = (hostName) => {
  const httpPort = getHostAttribute(hostName, 'HttpPort');
  const hostNameCellSelector = layoutTableHostNameCell(hostName);
  cy.get(hostNameCellSelector).nextAll().eq(2).should('have.text', httpPort);
};

const hostHasExpectedHttpsPort = (hostName) => {
  const httpsPort = getHostAttribute(hostName, 'HttpsPort');
  const hostNameCellSelector = layoutTableHostNameCell(hostName);
  cy.get(hostNameCellSelector).nextAll().eq(3).should('have.text', httpsPort);
};

const hostHasExpectedStartPriority = (hostName) => {
  const startPriority = getHostAttribute(hostName, 'StartPriority');
  const hostNameCellSelector = layoutTableHostNameCell(hostName);
  cy.get(hostNameCellSelector)
    .nextAll()
    .eq(4)
    .should('have.text', startPriority);
};

const hostStatusHasExpectedClass = (hostName) => {
  const status = getHostAttribute(hostName, 'Status');
  validateHostClass(hostName, status);
};

const validateHostClass = (hostName, status) => {
  const hostNameCellSelector = layoutTableHostNameCell(hostName);
  cy.get(hostNameCellSelector)
    .nextAll()
    .eq(5)
    .find('svg')
    .should('have.class', healthMap[status]);
};

const validateHostStatus = (hostName, status) => {
  const hostNameCellSelector = layoutTableHostNameCell(hostName);
  cy.get(hostNameCellSelector)
    .nextAll()
    .eq(5)
    .should('have.text', `SAPControl: ${status}`);
};

const hostHasExpectedStatus = (hostName) => {
  const status = getHostAttribute(hostName, 'Status');
  validateHostStatus(hostName, status);
};

export const hostHasStatus = (status) =>
  validateHostStatus(selectedDatabase.Hosts[0].Hostname, status);

export const hostHasClass = (status) =>
  validateHostClass(selectedDatabase.Hosts[0].Hostname, status);

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

const getHostAttribute = (hostname, attribute) => {
  const host = selectedDatabase.Hosts.find((h) => h.Hostname === hostname);
  return host ? host[attribute] : undefined;
};

const getAttachedHostAttribute = (hostname, attribute) => {
  const host = attachedHosts.find((h) => h.Name === hostname);
  return host ? host[attribute] : undefined;
};

const hostHostHasExpectedAddresses = (hostName) => {
  const hostNameCellSelector = hostsTableHostNameCell(hostName);
  const expectedAddresses = getAttachedHostAttribute(
    hostName,
    'Addresses'
  ).join('');
  cy.get(hostNameCellSelector).next().should('have.text', expectedAddresses);
};

const hostHasExpectedProvider = (hostName) => {
  const hostNameCellSelector = hostsTableHostNameCell(hostName);
  const expectedProviderValue = getAttachedHostAttribute(hostName, 'Provider');
  cy.get(hostNameCellSelector)
    .nextAll()
    .eq(1)
    .should('have.text', expectedProviderValue);
};

const hostHasExpectedClusterValue = (hostName) => {
  const hostNameCellSelector = hostsTableHostNameCell(hostName);
  const expectedCluster = getAttachedHostAttribute(hostName, 'Cluster');
  cy.get(hostNameCellSelector)
    .nextAll()
    .eq(2)
    .should('contain', expectedCluster);
};

const hostHasExpectedVersion = (hostName) => {
  const hostNameCellSelector = hostsTableHostNameCell(hostName);
  const expectedVersion = getAttachedHostAttribute(hostName, 'Version');
  cy.get(hostNameCellSelector)
    .nextAll()
    .eq(3)
    .should('have.text', expectedVersion);
};

const hostHasExpectedWorkingLink = (host) => {
  const hostNameCellSelector = hostsTableHostNameCell(host.Name);
  const hostNameSelector = `${hostNameCellSelector} a`;
  const expectedHref = `/hosts/${host.AgentId}`;
  cy.get(hostNameSelector).should('have.attr', 'href', expectedHref);
  cy.get(hostNameSelector).click();
  basePage.validateUrl(expectedHref);
  cy.go('back');
};

export const eachAttachedHostHasExpectedValues = () => {
  attachedHosts.forEach((host) => {
    hostHostHasExpectedAddresses(host.Name);
    hostHasExpectedProvider(host.Name);
    hostHasExpectedClusterValue(host.Name);
    hostHasExpectedVersion(host.Name);
  });
};

export const eachAttachedHostHasExpectedWorkingLink = () =>
  attachedHosts.forEach((host) => hostHasExpectedWorkingLink(host));

export const newInstanceIsDisplayed = () => {
  const newInstanceSelector = `div[class="mt-16"]:contains("Layout") td:contains("${selectedDatabase.Hosts[0].Hostname}")`;
  cy.get(newInstanceSelector).eq(1).should('be.visible');
  cy.get(`${newInstanceSelector} + td`).eq(1).should('have.text', 11);
};

export const tableHasExpectedAmountOfRows = (expectedAmountOfRows) =>
  cy.get(attachedHostsTableRows).should('have.length', expectedAmountOfRows);

export const deregisteredHostIsNotDisplayed = () =>
  cy.get(newRegisteredHost).should('not.exist');

export const deregisteredHostIsDisplayed = () =>
  cy.get(newRegisteredHost).should('be.visible');

// API

export const loadNewSapInstance = () =>
  basePage.loadScenario(`hana-database-detail-NEW`);

export const deregisterFirstAttachedHost = () =>
  basePage.apiDeregisterHost(attachedHosts[0].AgentId);

export const restoreFirstAttachedHost = () =>
  basePage.loadScenario(`host-${attachedHosts[0].Name}-restore`);

export const restoreDatabaseInstanceHealth = () =>
  basePage.loadScenario('hana-database-detail-GREEN');
