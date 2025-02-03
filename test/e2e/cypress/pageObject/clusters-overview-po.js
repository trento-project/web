export * from './base-po.js';
import * as basePage from './base-po.js';

import { createUserRequestFactory } from '@lib/test-utils/factories';
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
const addTagButtons = 'span span:contains("Add Tag")';
const removeEnv1TagButton = 'span span:contains("env1") span';

//Test data
const password = 'password';

const user = createUserRequestFactory.build({
  password,
  password_confirmation: password,
});

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

export const restoreClusterName = () => basePage.loadScenario('cluster-4-SOK');

const clusterIdByName = (clusterName) =>
  availableClusters.find(({ name }) => name === clusterName).id;

export const clusterNameLinkIsDisplayedAsId = (clusterName) => {
  const clusterID = clusterIdByName(clusterName);
  return waitForClustersEndpoint().then(() =>
    cy.get(tableRows).eq(8).find(rowCells).eq(1).should('have.text', clusterID)
  );
};

export const apiRemoveTagByClusterId = (clusterId, tagId) => {
  return basePage.apiLogin().then(({ accessToken }) =>
    cy.request({
      url: `api/v1/clusters/${clusterId}/tags/${tagId}`,
      method: 'DELETE',
      auth: { bearer: accessToken },
    })
  );
};

const apiGetClusters = () => {
  return basePage.apiLogin().then(({ accessToken }) => {
    const url = '/api/v2/clusters/';
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

const addTagByColumnValue = (columnValue, tagValue) => {
  cy.get(`td:contains(${columnValue})`)
    .parents('tr')
    .within(() => {
      cy.get(addTagButtons).type(`${tagValue}{enter}`);
    });
};

export const setClusterTags = () => {
  taggingRules.forEach(([clusterName, tag]) => {
    addTagByColumnValue(clusterName, tag);
  });
};

export const eachClusterTagsIsCorrectlyDisplayed = () => {
  taggingRules.forEach(([tag]) =>
    cy.get(`span span:contains(${tag})`).should('be.visible')
  );
};

export const deregisterHost = (hostId) => {
  const [webAPIHost, webAPIPort] = [
    Cypress.env('web_api_host'),
    Cypress.env('web_api_port'),
  ];

  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
  };

  return basePage.apiLogin().then(({ accessToken }) => {
    const url = `http://${webAPIHost}:${webAPIPort}/api/v1/hosts/${hostId}`;
    cy.request({
      method: 'DELETE',
      url: url,
      headers: headers,
      auth: {
        bearer: accessToken,
      },
    });
  });
};

export const deregisterAllClusterHosts = () => {
  hanaCluster1.hosts.forEach((hostId) => deregisterHost(hostId));
};

export const restoreClusterHosts = () =>
  basePage.loadScenario(`cluster-${hanaCluster1.name}-restore`);

export const clusterIsNotDisplayedWhenNodesAreDeregistered = () =>
  cy.get(`span span:contains("${hanaCluster1.name}")`).should('not.exist');

export const clusterNameIsDisplayed = () => {
  cy.get(`span span:contains("${hanaCluster1.name}")`).should('be.visible');
};

const apiSetTag = (clusterName, tag) => {
  const [webAPIHost, webAPIPort] = [
    Cypress.env('web_api_host'),
    Cypress.env('web_api_port'),
  ];
  const clusterID = clusterIdByName(clusterName);
  return basePage.apiLogin().then(({ accessToken }) =>
    cy.request({
      url: `http://${webAPIHost}:${webAPIPort}/api/v1/clusters/${clusterID}/tags/`,
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
  tagsForCluster1.forEach((tag) => apiSetTag('hana_cluster_1', tag));
};

export const hanaCluster1TagsAreDisplayed = () => {
  return cy
    .get(`tr:contains("${hanaCluster1.name}")`)
    .within(() =>
      cy
        .get(`span span:contains("${clusterTags[hanaCluster1.name]}")`)
        .should('be.visible')
    );
};

export const createUserWithoutAbilities = () => {
  return basePage.createUserWithAbilities(user, []);
};

export const createUserWithClusterTagsAbilities = () => {
  return basePage.createUserWithAbilities(user, [
    { name: 'all', resource: 'cluster_tags' },
  ]);
};

export const loginWithoutTagAbilities = () =>
  basePage.apiLoginAndCreateSession(user.username, password);

export const loginWithTagAbilities = () =>
  basePage.apiLoginAndCreateSession(user.username, password);

export const addTagButtonsAreDisabled = () => {
  cy.get(addTagButtons).should('have.class', 'opacity-50');
};

export const addTagButtonsAreNotsDisabled = () => {
  cy.get(addTagButtons).should('not.have.class', 'opacity-50');
};

export const removeTagButtonIsDisabled = () => {
  cy.get(removeEnv1TagButton).should('have.class', 'opacity-50');
};

export const removeTagButtonIsEnabled = () => {
  cy.get(removeEnv1TagButton).should('not.have.class', 'opacity-50');
};
