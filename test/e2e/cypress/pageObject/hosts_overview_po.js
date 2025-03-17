export * from './base_po';
import * as basePage from './base_po';

import { capitalize } from 'lodash';

// Test data
const sapSystemHostToDeregister = {
  id: '7269ee51-5007-5849-aaa7-7c4a98b0c9ce',
  sid: 'NWD',
};

const sapSystemHostsToDeregister = {
  sid: 'NWD',
  movedHostId: 'fb2c6b8a-9915-5969-a6b7-8b5a42de1971',
  initialHostId: '7269ee51-5007-5849-aaa7-7c4a98b0c9ce',
  initialHostname: 'vmnwdev01',
};

const hostToDeregister = 'vmhdbdev01';
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
const hostToDeregisterCleanupButton = `tr:contains("${hostToDeregister}") td:contains("Clean up")`;
const cleanupButtons = 'tbody tr button:contains("Clean up")';
const heartbeatFailingToaster = `p:contains("The host ${hostToDeregister} heartbeat is failing.")`;
const deregisterHostModalTitle = `div:contains("Clean up data discovered by agent on host ${hostToDeregister}")`;
const cleanupConfirmationButton = `${deregisterHostModalTitle} button:contains("Clean up")`;
const sapSystemToDeregister = `a:contains("${sapSystemHostToDeregister.sid}")`;
const initialHostName = `a:contains("${sapSystemHostsToDeregister.initialHostname}")`;
const addTagButton = 'span:contains("Add Tag")';
const removeTag1Button =
  'span[class*="leading-5"]:contains("tag1") span[aria-hidden="true"]';

// UI Interactions

export const visit = () => basePage.visit(url);

export const validateUrl = () => basePage.validateUrl(url);

export const clickNextPageButton = () => cy.get(nextPageSelector).click();

export const addTagToHost = () => {
  const host = _getHostToDeregisterData(hostToDeregister);
  basePage.addTagByColumnValue(host.name, host.tag);
};

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

export const cleanupButtonIsNotDisplayedForHostSendingHeartbeat = () => {
  cy.get(hostToDeregisterCleanupButton, { timeout: 20000 }).should('not.exist');
};

export const clickCleanupOnHostToDeregister = () =>
  cy.get(hostToDeregisterCleanupButton).click();

export const cleanupButtonIsDisplayedForHostSendingHeartbeat = () =>
  cy.get(hostToDeregisterCleanupButton).should('be.visible');

export const expectedAmountOfCleanupButtonsIsDisplayed = (amount) =>
  cy
    .get(cleanupButtons, {
      timeout: 20000,
    })
    .should('have.length', amount);

export const heartbeatFailingToasterIsDisplayed = () =>
  cy.get(heartbeatFailingToaster, { timeout: 20000 }).should('be.visible');

export const deregisterModalTitleIsDisplayed = () =>
  cy.get(deregisterHostModalTitle).should('be.visible');

export const clickCleanupConfirmationButton = () =>
  cy.get(cleanupConfirmationButton).click();

export const deregisteredHostIsNotVisible = () => {
  const host = _getHostToDeregisterData();
  cy.get(`#host-${host.id}`).should('not.exist');
};

export const restoredHostIsDisplayed = () => {
  const host = _getHostToDeregisterData();
  cy.get(`#host-${host.id}`, { timeout: 20000 }).should('be.visible');
};

export const tagOfRestoredHostIsDisplayed = () => {
  const host = _getHostToDeregisterData();
  cy.get(`tr:contains("${host.name}") td:contains("${host.tag}")`).should(
    'be.visible'
  );
};

export const sapSystemHasExpectedAmountOfHosts = (expectedHosts) =>
  cy.get(sapSystemToDeregister).should('have.length', expectedHosts);

export const deregisteredSapSystemIsNotDisplayed = () =>
  cy.get(sapSystemToDeregister).should('not.exist');

export const initialHostNameIsDisplayed = () =>
  cy.get(initialHostName).should('be.visible');

export const initialHostNameIsNotDisplayed = () =>
  cy.get(initialHostName).should('not.exist');

export const addTagButtonIsDisabled = () =>
  cy.get(addTagButton).should('have.class', 'opacity-50');

export const removeTag1ButtonIsDisabled = () =>
  cy.get(removeTag1Button).should('have.class', 'opacity-50');

export const addTagButtonIsEnabled = () =>
  cy.get(addTagButton).should('not.have.class', 'opacity-50');

export const removeTag1ButtonIsEnabled = () =>
  cy.get(removeTag1Button).should('not.have.class', 'opacity-50');

export const cleanupButtonsAreDisabled = () =>
  cy.get(cleanupButtons).should('be.disabled');

export const cleanupButtonsAreEnabled = () =>
  cy.get(cleanupButtons).should('not.be.disabled');

// API

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

// Helpers

const _getHostToDeregisterData = () => {
  const foundHost = availableHosts.find(
    (host) => host.name === hostToDeregister
  );
  return {
    name: foundHost.name,
    id: foundHost.id,
    tag: 'tag1',
  };
};

// API
export const startAgentHeartbeat = () => {
  const hostToDeregister = _getHostToDeregisterData();
  cy.task('startAgentHeartbeat', [hostToDeregister.id]);
};

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

export const apiRestoreCleanedUpHost = () =>
  basePage.loadScenario(`host-${hostToDeregister}-restore`);

export const apiDeregisterHost = () => {
  const { id } = _getHostToDeregisterData();
  basePage.apiDeregisterHost(id);
};

const apiRemoveTagByHostId = (hostId, tagId) => {
  return basePage.apiLogin().then(({ accessToken }) =>
    cy.request({
      url: `/api/v1/hosts/${hostId}/tags/${tagId}`,
      method: 'DELETE',
      auth: { bearer: accessToken },
    })
  );
};

export const apiDeleteAllHostsTags = () => {
  apiGetHosts().then((response) => {
    const clusterTags = getHostTags(response.body);
    Object.entries(clusterTags).forEach(([clusterId, tags]) => {
      tags.forEach((tag) => apiRemoveTagByHostId(clusterId, tag));
    });
  });
  return basePage.refresh();
};

const apiGetHosts = () => {
  return basePage.apiLogin().then(({ accessToken }) => {
    const url = '/api/v1/hosts';
    return cy
      .request({
        method: 'GET',
        url: url,
        auth: {
          bearer: accessToken,
        },
      })
      .then((response) => response);
  });
};

const getHostTags = (jsonData) => {
  const clusterTags = {};
  jsonData.forEach((cluster) => {
    if (cluster.tags && cluster.tags.length > 0) {
      clusterTags[cluster.id] = cluster.tags.map((tag) => tag.value);
    }
  });

  return clusterTags;
};

export const restoreSapSystem = () =>
  basePage.loadScenario(`sapsystem-${sapSystemHostToDeregister.sid}-restore`);

export const apiDeregisterSapSystemHost = () =>
  basePage.apiDeregisterHost(sapSystemHostToDeregister.id);

export const loadSapSystemsOverviewMovedScenario = () => {
  restoreSapSystem();
  basePage.loadScenario('sap-systems-overview-moved');
};

export const apiDeregisterMovedHost = () =>
  basePage.apiDeregisterHost(sapSystemHostsToDeregister.movedHostId);

export const apiDeregisterInitialHostId = () =>
  basePage.apiDeregisterHost(sapSystemHostsToDeregister.initialHostId);

export const apiSetTag = () => {
  const host = _getHostToDeregisterData(hostToDeregister);
  return basePage.apiLogin().then(({ accessToken }) =>
    cy.request({
      url: `/api/v1/hosts/${host.id}/tags`,
      method: 'POST',
      auth: { bearer: accessToken },
      body: { value: host.tag },
    })
  );
};

export const apiCreateUserWithHostTagsAbility = () => {
  basePage.createUserWithAbilities([{ name: 'all', resource: 'host_tags' }]);
};

export const apiCreateUserWithHostCleanupAbility = () =>
  basePage.createUserWithAbilities([{ name: 'cleanup', resource: 'host' }]);
