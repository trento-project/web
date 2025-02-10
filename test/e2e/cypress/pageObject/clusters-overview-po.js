export * from './base-po.js';
import * as basePage from './base-po.js';

import {
  availableClusters,
  healthyClusterScenario,
  unhealthyClusterScenario,
} from '../fixtures/clusters-overview/available_clusters';

const url = '/clusters';
const clustersEndpoint = '/api/v2/clusters';
const clustersEndpointAlias = 'clustersEndpoint';

//Selectors
const clusterNames = '.tn-clustername';
const paginationNavigationButtons = 'div[class*="bg-gray-50"] ul button';
const tableRows = 'tbody tr';
const rowCells = 'td';

//Test data
export const healthyClusterName = healthyClusterScenario.clusterName;
export const unhealthyClusterName = unhealthyClusterScenario.clusterName;

export const hanaCluster1 = {
  name: 'hana_cluster_1',
  hosts: [
    '13e8c25c-3180-5a9a-95c8-51ec38e50cfc',
    '0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4',
  ],
};

const clusterTags = {
  hana_cluster_1: 'env1',
  hana_cluster_2: 'env2',
  hana_cluster_3: 'env3',
};

const taggingRules = [
  ['hana_cluster_1', clusterTags.hana_cluster_1],
  ['hana_cluster_2', clusterTags.hana_cluster_2],
  ['hana_cluster_3', clusterTags.hana_cluster_3],
];

export const visit = () => basePage.visit(url);

export const validateUrl = () => basePage.validateUrl(url);

export const interceptClustersEndpoint = () =>
  cy.intercept(clustersEndpoint).as(clustersEndpointAlias);

export const waitForClustersEndpoint = () =>
  basePage.waitForRequest(clustersEndpointAlias);

// UI Interactions

export const setClusterTags = () => {
  taggingRules.forEach(([clusterName, tag]) => {
    basePage.addTagByColumnValue(clusterName, tag);
  });
};

// Validations

export const hanaCluster1TagsAreDisplayed = () => {
  return cy
    .get(`tr:contains("${hanaCluster1.name}")`)
    .within(() =>
      cy
        .get(`span span:contains("${clusterTags[hanaCluster1.name]}")`)
        .should('be.visible')
    );
};

export const clusterNameLinkIsDisplayedAsId = (clusterName) => {
  const clusterID = clusterIdByName(clusterName);
  return waitForClustersEndpoint().then(() =>
    cy.get(tableRows).eq(8).find(rowCells).eq(1).should('have.text', clusterID)
  );
};

export const allRegisteredClustersAreDisplayed = () =>
  cy.get(clusterNames).should('have.length', availableClusters.length);

export const paginationButtonsAreDisabled = () =>
  cy.get(paginationNavigationButtons).should('be.disabled');

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

export const healthyClusterNameDisplaysHealthyState = () =>
  clusterHealthIconHasExpectedClass(
    healthyClusterScenario.clusterName,
    'fill-jungle-green-500'
  );

export const unhealthyClusterNameDisplaysUnhealthyState = () =>
  clusterHealthIconHasExpectedClass(
    unhealthyClusterScenario.clusterName,
    'fill-red-500'
  );

export const clusterHealthIconHasExpectedClass = (clusterName, className) => {
  return cy
    .get(`td:contains("${clusterName}")`)
    .parents('tr')
    .within(() =>
      cy.get('td').eq(0).find('svg').should('have.class', className)
    );
};

export const eachClusterTagsIsCorrectlyDisplayed = () => {
  return taggingRules.forEach(([tag]) =>
    cy.get(`span span:contains(${tag})`).should('be.visible')
  );
};

export const clusterIsNotDisplayedWhenNodesAreDeregistered = () =>
  cy.get(`span span:contains("${hanaCluster1.name}")`).should('not.exist');

export const clusterNameIsDisplayed = () => {
  cy.get(`span span:contains("${hanaCluster1.name}")`).should('be.visible');
};

// Helpers

const clusterIdByName = (clusterName) =>
  availableClusters.find(({ name }) => name === clusterName).id;

// API Interactions

export const apiRemoveTagByClusterId = (clusterId, tagId) => {
  return basePage.apiLogin().then(({ accessToken }) =>
    cy.request({
      url: `/api/v1/clusters/${clusterId}/tags/${tagId}`,
      method: 'DELETE',
      auth: { bearer: accessToken },
    })
  );
};

const apiGetClusters = () => {
  return basePage.apiLogin().then(({ accessToken }) => {
    const url = '/api/v2/clusters';
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

export const apiRemoveAllTags = () => {
  apiGetClusters().then((response) => {
    const clusterTags = getClusterTags(response.body);
    Object.entries(clusterTags).forEach(([clusterId, tags]) => {
      tags.forEach((tag) => apiRemoveTagByClusterId(clusterId, tag));
    });
  });
  return basePage.refresh();
};

const getClusterTags = (jsonData) => {
  const clusterTags = {};
  jsonData.forEach((cluster) => {
    if (cluster.tags && cluster.tags.length > 0) {
      clusterTags[cluster.id] = cluster.tags.map((tag) => tag.value);
    }
  });

  return clusterTags;
};

export const apiDeregisterAllClusterHosts = () =>
  hanaCluster1.hosts.forEach((hostId) => basePage.apiDeregisterHost(hostId));

export const apiRestoreClusterHosts = () =>
  basePage.loadScenario(`cluster-${hanaCluster1.name}-restore`);

const apiSetTag = (clusterName, tag) => {
  const clusterID = clusterIdByName(clusterName);
  return basePage.apiLogin().then(({ accessToken }) =>
    cy.request({
      url: `/api/v1/clusters/${clusterID}/tags`,
      method: 'POST',
      auth: { bearer: accessToken },
      body: { value: tag },
    })
  );
};

export const apiSetTagsHanaCluster1 = () => {
  const tagsForCluster1 = taggingRules
    .filter(([cluster]) => cluster === 'hana_cluster_1')
    .map(([, tag]) => tag);
  return tagsForCluster1.forEach((tag) => apiSetTag('hana_cluster_1', tag));
};

const apiSelectChecks = (clusterId, checks) => {
  const checksBody = JSON.stringify({
    checks: checks,
  });

  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
  };

  return basePage.apiLogin().then(({ accessToken }) => {
    const url = `/api/clusters/${clusterId}/checks`;
    cy.request({
      method: 'POST',
      url: url,
      body: checksBody,
      headers: headers,
      auth: {
        bearer: accessToken,
      },
    });
  });
};

const apiRequestChecksExecution = (clusterId) => {
  return basePage.apiLogin().then(({ accessToken }) => {
    const url = `/api/clusters/${clusterId}/checks/request_execution`;
    cy.request({
      method: 'POST',
      url: url,
      auth: {
        bearer: accessToken,
      },
    });
  });
};

export const apiSelectChecksForHealthyCluster = () =>
  apiSelectChecks(
    clusterIdByName(healthyClusterScenario.clusterName),
    healthyClusterScenario.checks
  );

export const apiRequestChecksForHealthyCluster = () =>
  apiRequestChecksExecution(
    clusterIdByName(healthyClusterScenario.clusterName)
  );

export const apiSelectChecksForUnhealthyCluster = () =>
  apiSelectChecks(
    clusterIdByName(unhealthyClusterScenario.clusterName),
    healthyClusterScenario.checks
  );

export const apiRequestChecksForUnhealthyCluster = () =>
  apiRequestChecksExecution(
    clusterIdByName(unhealthyClusterScenario.clusterName)
  );

export const apiRemoveHealthyClusterChecks = () =>
  apiSelectChecks(clusterIdByName(healthyClusterScenario.clusterName), []);

export const apiRemoveUnhealthyClusterChecks = () =>
  apiSelectChecks(clusterIdByName(unhealthyClusterScenario.clusterName), []);

export const restoreClusterName = () => basePage.loadScenario('cluster-4-SOK');

export const apiCreateUserWithClusterTagsAbilities = () =>
  basePage.createUserWithAbilities([{ name: 'all', resource: 'cluster_tags' }]);
