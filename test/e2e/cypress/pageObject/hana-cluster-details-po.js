export * from './base-po.js';
import * as basePage from './base-po.js';

import { capitalize } from 'lodash';

// Test data

import {
  checksExecutionCompletedFactory,
  catalogCheckFactory,
} from '@lib/test-utils/factories';

import {
  availableHanaCluster,
  availableHanaClusterCostOpt,
  availableAngiCluster,
} from '../fixtures/hana-cluster-details/available_hana_cluster';

const lastExecution = checksExecutionCompletedFactory.build({
  group_id: availableHanaCluster.id,
  passing_count: 5,
  warning_count: 3,
  critical_count: 1,
});

const hostToDeregister = {
  name: 'vmhdbprd02',
  id: 'b767b3e9-e802-587e-a442-541d093b86b9',
  sid: 'WDF',
};

const catalog = catalogCheckFactory.buildList(5);

//Attributes

const url = '/clusters';
const catalogEndpointAlias = 'catalog';
const lastExecutionEndpointAlias = 'lastExecution';

// Selectors

const providerLabel = 'div[class*="text-lg"]:contains("Provider") + div';
const clusterSid = `div[class*="text-lg"]:contains("SID") + div a`;
const clusterTypeLabel = 'div[class*="text-lg"]:contains("Cluster type") + div';
const architectureInfoLabel =
  'div[class*="text-lg"]:contains("Cluster type") + div svg';
const logReplicationModeLabel =
  'div[class*="text-lg"]:contains("HANA log replication") + div';
const fencingTypeLabel = 'div[class*="text-lg"]:contains("Fencing type") + div';
const hanaSecondarySyncStateLabel =
  'div[class*="text-lg"]:contains("HANA secondary sync state") + div';
const maintenanceModeLabel =
  'div[class*="text-lg"]:contains("Cluster maintenance") + div span';
const hanaLogOperationModeLabel =
  'div[class*="text-lg"]:contains("HANA log operation mode") + div';

const cibLastWrittenLabel =
  'div[class*="text-lg"]:contains("CIB last written") + div';

const passingChecksButton = 'div[role="button"]:contains("Passing")';
const warningChecksButton = 'div[role="button"]:contains("Warning")';
const criticalChecksButton = 'div[role="button"]:contains("Critical")';

const passingChecksValue =
  'div[class*="flex w-full"]:contains("Passing") + div';
const warningChecksValue =
  'div[class*="flex w-full"]:contains("Warning") + div';
const criticalChecksValue =
  'div[class*="flex w-full"]:contains("Critical") + div';

const checkSelectionButton = 'button:contains("Check Selection")';

const startExecutionButton = 'button:contains("Start Execution")';
const saveChecksSelectionButton = 'button:contains("Save Checks Selection")';

// UI Interactions

export const visit = (clusterId = '') => {
  basePage.visit(`${url}/${clusterId}`);
  if (clusterId !== '') {
    basePage.waitForRequest(lastExecutionEndpointAlias);
    basePage.waitForRequest(catalogEndpointAlias);
  }
};

export const visitAvailableHanaCluster = () => visit(availableHanaCluster.id);

export const visitAvailableHanaClusterCostOpt = () =>
  visit(availableHanaClusterCostOpt.id);

export const visitHanaAngiCluster = () => visit(availableAngiCluster.id);

export const clickStartExecutionButton = () =>
  cy.get(startExecutionButton).click({ force: true });

export const mouseOverArchitectureInfo = () =>
  cy.get(architectureInfoLabel).trigger('mouseover');

export const mouseOverStartExecutionButton = () =>
  cy.get(startExecutionButton).trigger('mouseover', { force: true });

export const clickPassingChecksButton = () =>
  cy.get(passingChecksButton).click();

export const clickWarningChecksButton = () =>
  cy.get(warningChecksButton).click();

export const clickCriticalChecksButton = () =>
  cy.get(criticalChecksButton).click();

export const clickCheckSelectionButton = () =>
  cy.get(checkSelectionButton).click();

// UI Validations
const validateUrl = (path = '') => basePage.validateUrl(`${url}${path}`);

export const validateAvailableHanaClusterUrl = () =>
  validateUrl(`/${availableHanaCluster.id}`);

export const validateAvailableHanaClusterCostOptUrl = () =>
  validateUrl(`/${availableHanaClusterCostOpt.id}`);

export const expectedClusterNameIsDisplayedInHeader = () =>
  basePage.pageTitleIsCorrectlyDisplayed(availableHanaCluster.name);

export const expectedProviderIsDisplayed = (clusterType) => {
  const provider = getPropertyFromClusterType(clusterType, 'provider');
  cy.get(providerLabel).should('have.text', provider);
};

export const hasExpectedSidAndHrefAttribute = (clusterType) => {
  const systemId = getPropertyFromClusterType(clusterType, 'systemID');
  cy.get(clusterSid).should('have.attr', 'href', `/databases/${systemId}`);
};

export const hasExpectedSidsAndHrefAttributes = () =>
  cy.get(clusterSid).each((sid, index) => {
    cy.wrap(sid).should(
      'have.attr',
      'href',
      `/databases/${availableHanaClusterCostOpt.systemID[index]}`
    );
  });

export const hasExpectedClusterType = (clusterType) => {
  const clusterTypeProperty = getPropertyFromClusterType(
    clusterType,
    'clusterType'
  );
  cy.get(clusterTypeLabel).should('contain', clusterTypeProperty);
};

export const architectureTooltipIsDisplayed = (clusterType) => {
  const architectureType = getPropertyFromClusterType(
    clusterType,
    'architectureType'
  );
  const architectureTypeLabel = `span:contains("${architectureType}")`;
  cy.get(architectureTypeLabel).should('be.visible');
};

export const expectedReplicationModeIsDisplayed = (clusterType) => {
  const replicationMode = getPropertyFromClusterType(
    clusterType,
    'hanaSystemReplicationMode'
  );
  cy.get(logReplicationModeLabel).should('have.text', replicationMode);
};

export const expectedFencingTypeIsDisplayed = (clusterType) => {
  const fencingType = getPropertyFromClusterType(clusterType, 'fencingType');
  cy.get(fencingTypeLabel).should('have.text', fencingType);
};

export const expectedHanaSecondarySyncStateIsDisplayed = (clusterType) => {
  const hanaSecondarySyncState = getPropertyFromClusterType(
    clusterType,
    'hanaSecondarySyncState'
  );
  cy.get(hanaSecondarySyncStateLabel).should('contain', hanaSecondarySyncState);
};

export const expectedMaintenanceModeIsDisplayed = (clusterType) => {
  const maintenanceMode = getPropertyFromClusterType(
    clusterType,
    'maintenanceMode'
  );
  cy.get(maintenanceModeLabel).should(
    'have.text',
    capitalize(maintenanceMode.toString())
  );
};

export const expectedHanaLogOperationModeIsDisplayed = (clusterType) => {
  const hanaSystemReplicationOperationMode = getPropertyFromClusterType(
    clusterType,
    'hanaSystemReplicationOperationMode'
  );
  cy.get(hanaLogOperationModeLabel).should(
    'have.text',
    hanaSystemReplicationOperationMode
  );
};

export const expectedCibLastWrittenValueIsDisplayed = (clusterType) => {
  const cibLastWritten = getPropertyFromClusterType(
    clusterType,
    'cibLastWritten'
  );
  cy.get(cibLastWrittenLabel).should('have.text', cibLastWritten);
};

export const expectedPassingChecksCountIsDisplayed = () =>
  cy.get(passingChecksValue).should('have.text', lastExecution.passing_count);

export const expectedWarningChecksCountIsDisplayed = () =>
  cy.get(warningChecksValue).should('have.text', lastExecution.warning_count);

export const expectedCriticalChecksCountIsDisplayed = () =>
  cy.get(criticalChecksValue).should('have.text', lastExecution.critical_count);

export const allExpectedVirtualIPsAreDisplayed = () => {
  const virtualIps = getHostsProperty('virtualIps');
  cy.wrap(virtualIps).each(({ siteName, virtualIp }) => {
    cy.get(`.tn-site-details-${siteName} tbody td`)
      .eq(4)
      .should('contain', virtualIp);
  });
};

export const allExpectedIndexServerRolesAreDisplayed = () => {
  const indexServerRoles = getHostsProperty('indexserver_actual_role');
  cy.wrap(indexServerRoles).each(({ siteName, indexserver_actual_role }) => {
    cy.get(`.tn-site-details-${siteName} tbody td`)
      .eq(2)
      .should('have.text', capitalize(indexserver_actual_role));
  });
};

export const allExpectedNameServerRolesAreDisplayed = () => {
  const nameServerRoles = getHostsProperty('nameserver_actual_role');
  cy.wrap(nameServerRoles).each(({ siteName, nameserver_actual_role }) => {
    cy.get(`.tn-site-details-${siteName} tbody td`)
      .eq(1)
      .should('have.text', capitalize(nameserver_actual_role));
  });
};

export const allExpectedStatusesAreDisplayed = () => {
  const hostsStatuses = getHostsProperty('status');
  cy.wrap(hostsStatuses).each(({ siteName, status }) => {
    cy.get(`.tn-site-details-${siteName} tbody td svg`).should(
      'have.class',
      status
    );
  });
};

export const allExpectedIPsAreDisplayed = () => {
  const ips = getHostsProperty('ips');
  cy.wrap(ips).each(({ siteName, ip }) => {
    cy.get(`.tn-site-details-${siteName} tbody td`).eq(3).should('contain', ip);
  });
};

export const expectedSiteStatesAreDisplayed = () => {
  cy.wrap(availableHanaCluster.sites).each((site) => {
    cy.get(`.tn-site-details-${site.name} h3 + span`).should(
      'have.text',
      site.state
    );
  });
};

export const expectedSiteNamesAreDisplayed = () => {
  cy.wrap(availableHanaCluster.sites).each((site) => {
    cy.get(`.tn-site-details-${site.name} h3`).should('have.text', site.name);
  });
};

export const expectedSrHealthStatesAreDisplayed = () => {
  cy.wrap(availableHanaCluster.sites).each((site) => {
    cy.get(`.tn-site-details-${site.name} svg`).should(
      'have.class',
      site.srHealthState
    );
  });
};

export const sbdClusterHasExpectedNameAndStatus = () => {
  availableHanaCluster.sbd.forEach((item) => {
    cy.get('.tn-sbd-details')
      .contains(item.deviceName)
      .children()
      .contains(item.status);
  });
};

export const passingChecksUrlIsTheExpected = () =>
  validateUrl(`/${availableHanaCluster.id}/executions/last?health=passing`);

export const warningChecksUrlIsTheExpected = () =>
  validateUrl(`/${availableHanaCluster.id}/executions/last?health=warning`);

export const criticalChecksUrlIsTheExpected = () =>
  validateUrl(`/${availableHanaCluster.id}/executions/last?health=critical`);

export const availableHanaClusterCostOpHeaderIsDisplayed = () =>
  basePage.pageTitleIsCorrectlyDisplayed(availableHanaClusterCostOpt.name);

export const availableHanaAngiHeaderIsDisplayed = () =>
  basePage.pageTitleIsCorrectlyDisplayed(availableAngiCluster.name);

export const bothHanaCostOptSidsAreDisplayed = () => {
  cy.wrap(availableHanaClusterCostOpt.sids).each((sid) => {
    cy.get(`td:contains("${availableHanaClusterCostOpt.name}") + td`).should(
      'contain',
      sid
    );
  });
};

export const saveChecksSelectionButtonIsDisabled = () =>
  cy.get(saveChecksSelectionButton).should('be.disabled');

export const saveChecksSelectionButtonIsDisplayed = () =>
  cy.get(saveChecksSelectionButton).should('be.visible');

export const hanaAngiClusterSitesAreDisplayed = () => {
  cy.wrap(availableAngiCluster.sites).each((site) => {
    cy.get(`.tn-site-details-${site.name} h3 + span`).should(
      'have.text',
      site.state
    );
  });
};

export const hanaAngiSitesHaveExpectedStateAfterFailover = () => {
  const site1 = availableAngiCluster.sites[0];
  const site2 = availableAngiCluster.sites[1];
  cy.get(`.tn-site-details-${site1.name} h3 + span`).should(
    'have.text',
    'Failed'
  );
  cy.get(`.tn-site-details-${site2.name} h3 + span`).should(
    'have.text',
    site1.state
  );
};

export const linkToDeregisteredHostIsNotAvailable = () => {
  cy.get(
    `div[class*="tn-site-details-${hostToDeregister.sid}"] tbody td span:contains("${hostToDeregister.name}")`
  ).should('not.have.attr', 'href');
};

export const linkToDeregisteredHostIsAvailable = () => {
  cy.get(
    `div[class*="tn-site-details-${hostToDeregister.sid}"] tbody td a:contains("${hostToDeregister.name}")`
  ).should('have.attr', 'href');
};

export const startExecutionButtonIsDisabled = () =>
  cy.get(startExecutionButton).should('be.disabled');

export const notAuthorizedTooltipIsDisplayed = () => {
  cy.get('span:contains("You are not authorized for this action")').should(
    'be.visible'
  );
};

export const notAuthorizedTooltipIsNotDisplayed = () => {
  cy.get('span:contains("You are not authorized for this action")').should(
    'not.exist'
  );
};

// API
export const interceptLastExecutionRequest = () => {
  const lastExecutionURL = '/api/v2/checks/groups/**/executions/last';
  cy.intercept(lastExecutionURL, {
    body: lastExecution,
  }).as(lastExecutionEndpointAlias);
};

export const interceptCatalogRequest = () => {
  const catalogURL = `**/api/v3/checks/catalog*`;
  cy.intercept(catalogURL, { body: { items: catalog } }).as(
    catalogEndpointAlias
  );
};

export const apiDeregisterWdfHost = () =>
  basePage.apiDeregisterHost(hostToDeregister.id);

export const apiRestoreWdfHost = () =>
  basePage.loadScenario(`host-${hostToDeregister.name}-restore`);

export const apiCreateUserWithChecksExecutionAbility = () => {
  basePage.createUserWithAbilities([
    {
      name: 'all',
      resource: 'cluster_checks_execution',
    },
  ]);
};

export const apiCreateUserWithChecksSelectionAbility = () => {
  basePage.createUserWithAbilities([
    {
      name: 'all',
      resource: 'cluster_checks_selection',
    },
  ]);
};

export const deregisterHanaClusterCostOptHosts = () =>
  availableHanaClusterCostOpt.hosts.forEach(({ id }) =>
    basePage.apiDeregisterHost(id)
  );

export const deregisterAngiClusterCostOptHosts = () =>
  availableAngiCluster.hosts.forEach(({ id }) =>
    basePage.apiDeregisterHost(id)
  );

// Helpers

const getHostsProperty = (property) => {
  const result = [];
  availableHanaCluster.sites.forEach((site) => {
    site.hosts.forEach((host) => {
      const isPropertyArray = Array.isArray(host[property]);
      if (isPropertyArray) {
        host[property].forEach((value) => {
          const propertySingular = property.slice(0, -1);
          result.push({ siteName: site.name, [propertySingular]: value });
        });
      } else {
        result.push({ siteName: site.name, [property]: host[property] });
      }
    });
  });
  return result;
};

const getPropertyFromClusterType = (clusterType, property) => {
  const clusterMap = {
    hana: availableHanaCluster,
    hanaCostOpt: availableHanaClusterCostOpt,
    angi: availableAngiCluster,
  };
  const cluster = clusterMap[clusterType];
  if (!cluster) {
    const customValueToCheck = clusterType;
    return customValueToCheck;
  }
  return cluster[property];
};
