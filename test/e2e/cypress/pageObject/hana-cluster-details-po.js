export * from './base-po.js';
import * as basePage from './base-po.js';

import { capitalize } from 'lodash';

// Test data
import {
  checksExecutionCompletedFactory,
  catalogCheckFactory,
  createUserRequestFactory,
} from '@lib/test-utils/factories';

const url = '/clusters';
const catalogEndpointAlias = 'catalog';
const lastExecutionEndpointAlias = 'lastExecution';
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

const catalog = catalogCheckFactory.buildList(5);

// Selectors
const providerLabel = 'div[class*="text-lg"]:contains("Provider") + div';
const availableHanaClusterSid = `div[class*="text-lg"]:contains("SID") + div a:contains("${availableHanaCluster.sid}")`;
const clusterType = 'div[class*="text-lg"]:contains("Cluster type") + div';
const architectureInfoLabel =
  'div[class*="text-lg"]:contains("Cluster type") + div svg';
const architectureTooltip = `span:contains("${availableHanaCluster.architectureType}")`;
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

const passingChecksValue =
  'div[class*="flex w-full"]:contains("Passing") + div';
const warningChecksValue =
  'div[class*="flex w-full"]:contains("Warning") + div';
const criticalChecksValue =
  'div[class*="flex w-full"]:contains("Critical") + div';

export const visit = (clusterId = '') => {
  basePage.visit(`${url}/${clusterId}`);
};

export const visitAvailableHanaCluster = () => {
  interceptCatalogRequest();
  interceptLastExecutionRequest();
  visit(availableHanaCluster.id);
  basePage.waitForRequest(lastExecutionEndpointAlias);
  return basePage.waitForRequest(catalogEndpointAlias);
};

const validateUrl = (clusterId = '') =>
  basePage.validateUrl(`${url}/${clusterId}`);

export const validateAvailableHanaClusterUrl = () =>
  validateUrl(availableHanaCluster.id);

export const expectedClusterNameIsDisplayedInHeader = () => {
  basePage.pageTitleIsCorrectlyDisplayed(availableHanaCluster.name);
};

export const expectedProviderIsDisplayed = () => {
  return cy
    .get(providerLabel)
    .should('have.text', availableHanaCluster.provider);
};

export const hasExpectedSidAndHrefAttribute = () => {
  return cy
    .get(availableHanaClusterSid)
    .should('have.attr', 'href', `/databases/${availableHanaCluster.systemID}`);
};

export const hasExpectedClusterType = () => {
  return cy
    .get(clusterType)
    .should('contain', availableHanaCluster.clusterType);
};

// API
const interceptLastExecutionRequest = () => {
  const lastExecutionURL = `**/api/v2/checks/groups/**/executions/last`;

  return cy
    .intercept(lastExecutionURL, {
      body: lastExecution,
    })
    .as(lastExecutionEndpointAlias);
};

const interceptCatalogRequest = () => {
  const catalogURL = `**/api/v3/checks/catalog*`;
  cy.intercept(catalogURL, { body: { items: catalog } }).as(
    catalogEndpointAlias
  );
};

export const mouseOverArchitectureInfo = () =>
  cy.get(architectureInfoLabel).trigger('mouseover');

export const architectureTooltipIsDisplayed = () =>
  cy.get(architectureTooltip).should('be.visible');

export const expectedReplicationModeIsDisplayed = () =>
  cy
    .get(logReplicationModeLabel)
    .should('have.text', availableHanaCluster.hanaSystemReplicationMode);

export const expectedFencingTypeIsDisplayed = () =>
  cy
    .get(fencingTypeLabel)
    .should('have.text', availableHanaCluster.fencingType);

export const expectedHanaSecondarySyncStateIsDisplayed = () =>
  cy
    .get(hanaSecondarySyncStateLabel)
    .should('contain', availableHanaCluster.hanaSecondarySyncState);

export const expectedMaintenanceModeIsDisplayed = () => {
  cy.get(maintenanceModeLabel).should(
    'have.text',
    capitalize(availableHanaCluster.maintenanceMode.toString())
  );
};

export const expectedHanaLogOperationModeIsDisplayed = () =>
  cy
    .get(hanaLogOperationModeLabel)
    .should(
      'have.text',
      availableHanaCluster.hanaSystemReplicationOperationMode
    );

export const expectedCibLastWrittenValueIsDisplayed = () =>
  cy
    .get(cibLastWrittenLabel)
    .should('have.text', availableHanaCluster.cibLastWritten);

export const expectedPassingChecksCountIsDisplayed = () =>
  cy.get(passingChecksValue).should('have.text', lastExecution.passing_count);

export const expectedWarningChecksCountIsDisplayed = () =>
  cy.get(warningChecksValue).should('have.text', lastExecution.warning_count);

export const expectedCriticalChecksCountIsDisplayed = () =>
  cy.get(criticalChecksValue).should('have.text', lastExecution.critical_count);

export const allExpectedIPsAreDisplayed = () => {
  const ips = getHostsProperty('ips');
  cy.wrap(ips).each(({ siteName, ip }) => {
    cy.get(`.tn-site-details-${siteName} tbody td`).eq(3).should('contain', ip);
  });
};

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

export const expectedSiteStatesAreDisplayed = () => {
  return cy.wrap(availableHanaCluster.sites).each((site) => {
    cy.get(`.tn-site-details-${site.name} h3 + span`).should(
      'have.text',
      site.state
    );
  });
};

export const expectedSiteNamesAreDisplayed = () => {
  return cy.wrap(availableHanaCluster.sites).each((site) => {
    cy.get(`.tn-site-details-${site.name} h3`).should('have.text', site.name);
  });
};

export const expectedSrHealthStatesAreDisplayed = () => {
  return cy.wrap(availableHanaCluster.sites).each((site) => {
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
