// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

export * from './base_po';
import * as basePage from './base_po';

// Test Data
import {
  selectedDatabase,
  secondaryStoppedSites,
  allStoppedSites,
  attachedHosts,
} from '../fixtures/hana-database-details/selected_database.js';

import { healthMap } from '../fixtures/sap-system-details/selected_system.js';

const url = '/databases';

// Selectors
const databaseNameLabel =
  'div[class*="grid-flow-row"]:contains("Name") div span';
const databaseTypeLabel =
  'div[class*="grid-flow-row"]:contains("Type") div span';
const systemReplicationLabel =
  'div[class*="grid-flow-row"]:contains("System Replication") div:nth-child(2)';
const pageNotFoundLabel = 'div:contains("Not Found")';
const pageTitleHealthIcons = 'h1 div svg';
const staleDataBanner =
  'span[data-testid="banner"]:contains("An agent in one of the database hosts is not reporting since")';
const attachedHostsTableRows = 'div[class="mt-16"]:contains("Layout") tbody tr';
const newRegisteredHost = `div[class="mt-8"]:contains("Hosts") td:contains("${attachedHosts[0].Name}")`;
const layoutTableHostNameCell = (hostName) =>
  `div[class="mt-16"]:contains("Layout") td:contains("${hostName}")`;
const hostsTableHostNameCell = (hostName) =>
  `div[class="mt-8"]:contains("Hosts") td:contains("${hostName}")`;
const layoutTableHostRow = (hostName) =>
  `div[class="mt-16"]:contains("Layout") tr:has(td:contains("${hostName}"))`;
const hostsTableHostRow = (hostName) =>
  `div[class="mt-8"]:contains("Hosts") tr:has(td:contains("${hostName}"))`;
const siteReplicationHeader = (site) =>
  `div[class*="border-gray-200"]:has(h3:contains("${site}"))`;
const siteHeader = (site) => `div:has(div > h3:contains("${site}"))`;

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

export const pageTitleHealthIsCorrectlyDisplayed = () =>
  basePage.pageTitleHealthIsCorrectlyDisplayed(selectedDatabase.Health);

export const databaseHasExpectedName = () =>
  cy.get(databaseNameLabel).should('have.text', selectedDatabase.Sid);

export const databaseHasExpectedType = () =>
  cy.get(databaseTypeLabel).should('have.text', selectedDatabase.Type);

export const databaseHasExpectedSystemReplication = () =>
  cy
    .get(systemReplicationLabel)
    .should('have.text', selectedDatabase.SystemReplication);

export const pageNotFoundLabelIsDisplayed = () =>
  cy.get(pageNotFoundLabel).should('be.visible');

const hostNameHasExpectedInstanceNumber = (hostName) => {
  const instanceNumber = getHostAttribute(hostName, 'Instance');
  const hostNameCellSelector = layoutTableHostNameCell(hostName);
  return cy
    .get(hostNameCellSelector)
    .next()
    .should('have.text', instanceNumber);
};

const hostNameHasExpectedFeatures = (hostName) => {
  const features = getHostAttribute(hostName, 'Features');
  const formattedFeatures = features.replace(/\|/g, '');
  const hostNameCellSelector = layoutTableHostNameCell(hostName);
  return cy
    .get(hostNameCellSelector)
    .nextAll()
    .eq(1)
    .should('have.text', formattedFeatures);
};

const hostHasExpectedHttpPort = (hostName) => {
  const httpPort = getHostAttribute(hostName, 'HttpPort');
  const hostNameCellSelector = layoutTableHostNameCell(hostName);
  return cy
    .get(hostNameCellSelector)
    .nextAll()
    .eq(2)
    .should('have.text', httpPort);
};

const hostHasExpectedHttpsPort = (hostName) => {
  const httpsPort = getHostAttribute(hostName, 'HttpsPort');
  const hostNameCellSelector = layoutTableHostNameCell(hostName);
  return cy
    .get(hostNameCellSelector)
    .nextAll()
    .eq(3)
    .should('have.text', httpsPort);
};

const hostHasExpectedStartPriority = (hostName) => {
  const startPriority = getHostAttribute(hostName, 'StartPriority');
  const hostNameCellSelector = layoutTableHostNameCell(hostName);
  return cy
    .get(hostNameCellSelector)
    .nextAll()
    .eq(4)
    .should('have.text', startPriority);
};

const hostStatusHasExpectedClass = (hostName) => {
  const status = getHostAttribute(hostName, 'Status');
  return validateHostClass(hostName, status);
};

const getSiteContainer = (site) => cy.get(siteHeader(site));

const siteHasExpectedName = (site) => {
  getSiteContainer(site).should('include.text', site);
};

const siteHasExpectedSystemReplication = (site, systemReplication) => {
  getSiteContainer(site).should('include.text', systemReplication);
};

const siteHasExpectedTier = (site, tier) => {
  getSiteContainer(site).should('include.text', tier);
};

const siteHasExpectedStatus = (site, status) => {
  getSiteContainer(site).should('include.text', status);
};

const siteHasExpectedReplicating = (site, replicating) => {
  getSiteContainer(site).should('include.text', replicating);
};

const siteHasExpectedReplicationMode = (site, replicationMode) => {
  getSiteContainer(site).should('include.text', replicationMode);
};

const siteHasExpectedOperationMode = (site, operationMode) => {
  getSiteContainer(site).should('include.text', operationMode);
};

const validateHostClass = (hostName, status) => {
  const hostNameCellSelector = layoutTableHostNameCell(hostName);
  return cy
    .get(hostNameCellSelector)
    .prev()
    .find('svg')
    .should('have.class', healthMap[status]);
};

const validateHostStatus = (hostName, status) => {
  const hostNameCellSelector = layoutTableHostNameCell(hostName);
  cy.get(hostNameCellSelector).prev().find('svg').trigger('mouseover');

  return cy.get(`span:contains("${status}")`).should('exist');
};

const hostHasExpectedStatus = (hostName) => {
  const status = getHostAttribute(hostName, 'Status');
  return validateHostStatus(hostName, status);
};

export const hostHasStatus = (status) =>
  validateHostStatus(selectedDatabase.Hosts[0].Hostname, status);

export const hostHasClass = (status) =>
  validateHostClass(selectedDatabase.Hosts[0].Hostname, status);

export const eachHostNameHasExpectedValues = () =>
  cy.wrap(selectedDatabase.Hosts).each((host) => {
    const hostName = host.Hostname;
    hostHasExpectedStatus(hostName);
    hostStatusHasExpectedClass(hostName);
    hostNameHasExpectedInstanceNumber(hostName);
    hostNameHasExpectedFeatures(hostName);
    hostHasExpectedHttpPort(hostName);
    hostHasExpectedHttpsPort(hostName);
    return hostHasExpectedStartPriority(hostName);
  });

export const eachSiteHasExpectedValues = (sites) =>
  cy.wrap(sites).each((site) => {
    siteHasExpectedName(site.Name);
    siteHasExpectedSystemReplication(site.Name, site.SystemReplication);
    siteHasExpectedTier(site.Name, site.Tier);
    site.Status && siteHasExpectedStatus(site.Name, site.Status);
    site.Replicating && siteHasExpectedReplicating(site.Name, site.Replicating);
    site.ReplicationMode &&
      siteHasExpectedReplicationMode(site.Name, site.ReplicationMode);
    site.OperationMode &&
      siteHasExpectedOperationMode(site.Name, site.OperationMode);
  });

export const runningSitesHaveExpectedValues = () =>
  eachSiteHasExpectedValues(selectedDatabase.Sites);

export const secondaryStoppedSitesHaveExpectedValues = () =>
  eachSiteHasExpectedValues(secondaryStoppedSites);

export const stoppedSitesHaveExpectedValues = () =>
  eachSiteHasExpectedValues(allStoppedSites);

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
  return cy
    .get(hostNameCellSelector)
    .next()
    .should('have.text', expectedAddresses);
};

const hostHasExpectedProvider = (hostName) => {
  const hostNameCellSelector = hostsTableHostNameCell(hostName);
  const expectedProviderValue = getAttachedHostAttribute(hostName, 'Provider');
  return cy
    .get(hostNameCellSelector)
    .nextAll()
    .eq(1)
    .should('have.text', expectedProviderValue);
};

const hostHasExpectedClusterValue = (hostName) => {
  const hostNameCellSelector = hostsTableHostNameCell(hostName);
  const expectedCluster = getAttachedHostAttribute(hostName, 'Cluster');
  return cy
    .get(hostNameCellSelector)
    .nextAll()
    .eq(2)
    .should('contain', expectedCluster);
};

const hostHasExpectedVersion = (hostName) => {
  const hostNameCellSelector = hostsTableHostNameCell(hostName);
  const expectedVersion = getAttachedHostAttribute(hostName, 'Version');
  return cy
    .get(hostNameCellSelector)
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
  return basePage.goBack();
};

export const eachAttachedHostHasExpectedValues = () =>
  cy.wrap(attachedHosts).each((host) => {
    hostHostHasExpectedAddresses(host.Name);
    hostHasExpectedProvider(host.Name);
    hostHasExpectedClusterValue(host.Name);
    return hostHasExpectedVersion(host.Name);
  });

export const eachAttachedHostHasExpectedWorkingLink = () =>
  cy.wrap(attachedHosts).each((host) => hostHasExpectedWorkingLink(host));

export const newInstanceIsDisplayed = () => {
  const newInstanceSelector = `div[class="mt-16"]:contains("Layout") td:contains("${selectedDatabase.Hosts[0].Hostname}")`;
  cy.get(newInstanceSelector).eq(1).should('be.visible');
  return cy.get(`${newInstanceSelector} + td`).eq(1).should('have.text', 11);
};

export const tableHasExpectedAmountOfRows = (expectedAmountOfRows) =>
  cy.get(attachedHostsTableRows).should('have.length', expectedAmountOfRows);

export const deregisteredHostIsNotDisplayed = () =>
  cy.get(newRegisteredHost).should('not.exist');

export const deregisteredHostIsDisplayed = () =>
  cy.get(newRegisteredHost, { timeout: 20000 }).should('be.visible');

export const databaseHealthIsMarkedAsStale = () =>
  cy.get(pageTitleHealthIcons, { timeout: 20000 }).should('have.length', 2);

export const databaseHealthIsMarkedInSync = () =>
  cy.get(pageTitleHealthIcons).should('have.length', 1);

export const databaseStaleBannerIsDisplayed = () =>
  cy.get(staleDataBanner, { timeout: 20000 }).should('be.visible');

export const databaseStaleBannerIsNotDisplayed = () =>
  cy.get(staleDataBanner).should('not.exist');

export const databaseSiteIsMarkedAsStale = () =>
  cy
    .get(siteReplicationHeader(selectedDatabase.Sites[0].Name), {
      timeout: 20000,
    })
    .should('have.class', 'bg-gray-100');

export const databaseSiteIsMarkedInSync = () =>
  cy
    .get(siteReplicationHeader(selectedDatabase.Sites[0].Name))
    .should('not.have.class', 'bg-gray-100');

export const databaseInstanceRowIsMarkedAsStale = () =>
  cy
    .get(layoutTableHostRow(attachedHosts[1].Name), { timeout: 20000 })
    .should('have.class', 'bg-gray-100');

export const databaseInstanceRowIsMarkedInSync = () =>
  cy
    .get(layoutTableHostRow(attachedHosts[1].Name))
    .should('not.have.class', 'bg-gray-100');

export const hostRowIsMarkedAsStale = () =>
  cy
    .get(hostsTableHostRow(attachedHosts[1].Name), { timeout: 20000 })
    .should('have.class', 'bg-gray-100');

export const hostRowIsMarkedInSync = () =>
  cy
    .get(hostsTableHostRow(attachedHosts[1].Name))
    .should('not.have.class', 'bg-gray-100');

// API

export const loadNewSapInstance = () =>
  basePage.loadScenario(`hana-database-detail-NEW`);

export const deregisterFirstAttachedHost = () =>
  basePage.apiDeregisterHost(attachedHosts[0].AgentId);

export const restoreFirstAttachedHost = () =>
  basePage.loadScenario(`host-${attachedHosts[0].Name}-restore`);

export const restoreDatabaseInstanceHealth = () =>
  basePage.loadScenario('hana-database-detail-GREEN');

export const markDatabaseAsPresent = () =>
  basePage.loadScenario(
    `sap-systems-overview-${selectedDatabase.Sid}-${selectedDatabase.Hosts[1].Instance}-present`
  );

export const startDatabaseAgentsHeartbeat = () =>
  basePage.startAgentsHeartbeat(attachedHosts.map((host) => host.AgentId));

export const startDatabaseAgentHeartbeat = () =>
  basePage.startAgentsHeartbeat([attachedHosts[1].AgentId]);

export const stopDatabaseAgentHeartbeat = () =>
  basePage.stopAgentsHeartbeat([attachedHosts[1].AgentId]);
