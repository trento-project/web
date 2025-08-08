export * from './base_po.js';
import * as basePage from './base_po.js';

// Test data
const url = '/sap_systems';

import {
  availableSAPSystems,
  availableJavaSystem,
  isHanaInstance,
  healthMap,
} from '../fixtures/sap-systems-overview/available_sap_systems';

const sapSystemNwd = {
  sid: 'NWD',
  id: '67b247e4-ab5b-5094-993a-a4fd70d0e8d1',
  hostId: '9a3ec76a-dd4f-5013-9cf0-5eb4cf89898f',
  instanceNumber: '02',
  hostname: 'vmnwdev01',
  messageserverInstance: {
    instanceNumber: '00',
  },
  appInstance: {
    instanceNumber: '01',
  },
  applicationInstances: [
    {
      name: 'vmnwdev03',
      id: '9a3ec76a-dd4f-5013-9cf0-5eb4cf89898f',
    },
    {
      name: 'vmnwdev04',
      id: '1b0e9297-97dd-55d6-9874-8efde4d84c90',
    },
  ],
};

const sapSystemNwp = {
  sid: 'NWP',
  hanaPrimary: {
    name: 'vmhdbprd01',
    id: '9cd46919-5f19-59aa-993e-cf3736c71053',
  },
};

const sapSystemNwq = {
  sid: 'NWQ',
  messageserverInstance: {
    name: 'vmnwqas01',
    id: '25677e37-fd33-5005-896c-9275b1284534',
  },
};

const instancesData = availableSAPSystems.flatMap((system) => system.instances);

// Selectors
const sapSystemsTableRows = 'tbody tr[class=""]';
const firstSystemApplicationLayerRows =
  'tbody tr:nth-child(odd):eq(0) + tr td div[class*="row-group"]:eq(0) div[class*="row border"]';
const cleanUpButton = 'button:contains("Clean up")';
const nwdInstance01CleanUpButton = `tbody tr:eq(0) + tr td div[class*="row-group"]:eq(0) div[class*="row border"]:eq(1) div[class*="cell"]:contains('Clean up')`;
const nwdInstance00CleanUpButton = `tbody tr:eq(0) + tr td div[class*="row-group"]:eq(0) div[class*="row border"]:eq(0) div[class*="cell"]:contains('Clean up')`;
const modalCleanUpConfirmationButton =
  'div[id*="headlessui-dialog-panel"] button:contains("Clean up")';
const addTagButton = 'span:contains("Add Tag")';
const existentEnv3Tag = '[data-test-id="tag-env3"]';
const instancesRowsSelector =
  'tr:nth-child(odd) + tr div[class*="row-group"] div[class*="row border"]';
const hanaClusterLinks = 'div[class*="cell"] a span:contains("hana")';
const instanceHostLinks = 'div[class*="cell"] a[href*="/host"]';
const systemToRemoveCollapsibleCell = `${sapSystemsTableRows}:eq(0) td:first-child`;
const nwdSystemRowCollapsibleCell = `tr:contains('${sapSystemNwd.sid}') > td:eq(0)`;

// UI Interactions
export const visit = () => {
  cy.intercept('/api/v1/databases').as('databasesRequest');
  basePage.visit(url);
  cy.wait('@databasesRequest');
};

export const tagSapSystems = () => {
  availableSAPSystems.forEach(({ sid, tag }) => {
    basePage.addTagByColumnValue(sid, tag);
  });
};

export const expandSystemToRemove = () =>
  cy.get(systemToRemoveCollapsibleCell).click();

export const expandNwdSapSystem = () =>
  cy.get(nwdSystemRowCollapsibleCell).click();

export const clickNwdInstance01CleanUpButton = () =>
  cy.get(nwdInstance01CleanUpButton).click();

export const clickNwdInstance00CleanUpButton = () =>
  cy.get(nwdInstance00CleanUpButton).click();

export const clickCleanUpModalConfirmationButton = () =>
  cy.get(modalCleanUpConfirmationButton).click();

const clickAllRows = () => {
  const expandTableElement = 'td svg[class*="cursor"]';
  cy.get(expandTableElement).each((cell, index) => {
    cy.get(`${expandTableElement}:eq(${index})`).click();
  });
};

// UI Validations
export const nwdInstance01CleanUpButtonIsVisible = () =>
  cy.get(nwdInstance01CleanUpButton).should('be.visible');

export const nwdInstance01CleanUpButtonIsNotVisible = () =>
  cy.get(nwdInstance01CleanUpButton).should('not.exist');

export const validateUrl = (_url = url) => basePage.validateUrl(_url);

export const systemApplicationLayerRowsAreTheExpected = (amount) =>
  cy.get(firstSystemApplicationLayerRows).should('have.length', amount);

export const movedSystemIsNotDisplayed = () =>
  cy.get(`td:contains('${sapSystemNwd.hostname}')`).should('not.exist');

export const expectedSidsAreDisplayed = () => {
  availableSAPSystems.forEach(({ sid: sid }) => {
    cy.get(`td:contains('${sid}')`).should('be.visible');
  });
};

export const eachSystemHasItsExpectedWorkingLink = () => {
  availableSAPSystems.forEach(({ sid: sid, id: id }) => {
    cy.get(`td:contains("${sid}")`).click();
    basePage.validateUrl(`${url}/${id}`);
    cy.go('back');
  });
};

export const eachSystemHasExpectedHealth = () => {
  availableSAPSystems.forEach(({ health: health }, index) => {
    const healthClass = healthMap[health];
    const healthCellSelector = `tbody tr:nth-child(odd):eq(${index}) td:eq(1) svg`;
    cy.get(healthCellSelector).should('have.class', healthClass);
  });
};

export const eachAttachedDatabaseDetailsAreTheExpected = () => {
  const tableCell = (rowIndex, columnIndex) =>
    `tbody tr:nth-child(odd):eq(${rowIndex}) td:eq(${columnIndex})`;

  availableSAPSystems.forEach(
    ({ attachedDatabase: attachedDatabase, type: type }, rowIndex) => {
      cy.get(tableCell(rowIndex, 3)).should('have.text', attachedDatabase.sid);
      cy.get(tableCell(rowIndex, 4)).should(
        'have.text',
        attachedDatabase.tenant
      );
      cy.get(tableCell(rowIndex, 5)).should('have.text', type);
      cy.get(tableCell(rowIndex, 6)).should(
        'have.text',
        attachedDatabase.dbAddress
      );
    }
  );
};

export const sapSystemNwdIsDisplayed = () =>
  cy
    .get(`td:contains('${sapSystemNwd.sid}')`, { timeout: 15000 })
    .should('be.visible');

export const sapSystemNwdIsNotDisplayed = () =>
  cy
    .get(`td:contains('${sapSystemNwd.sid}')`, { timeout: 15000 })
    .should('not.exist');

export const nwpSystemIsDisplayed = () =>
  cy.get(`td:contains('${sapSystemNwp.sid}')`).should('be.visible');

export const nwqSystemIsNotDisplayed = () =>
  cy
    .get(`td:contains('${sapSystemNwq.sid}')`, { timeout: 15000 })
    .should('not.exist');

export const nwqSystemIsDisplayed = () =>
  cy.get(`td:contains('${sapSystemNwq.sid}')`).should('be.visible');

export const nwpSystemIsNotDisplayed = () =>
  cy
    .get(`td:contains('${sapSystemNwp.sid}')`, { timeout: 15000 })
    .should('not.exist');

export const eachSystemHasItsDatabaseWorkingLink = () => {
  availableSAPSystems.forEach(
    ({ attachedDatabase: attachedDatabase }, index) => {
      const databaseSidLink = `tbody > tr:nth-child(odd):eq(${index}) td:contains("${attachedDatabase.sid}") a`;
      cy.get(databaseSidLink).click();
      validateUrl(`/databases/${attachedDatabase.id}`);
      cy.go('back');
    }
  );
};

const validateInstanceRowData = (instance, rowIndex) => {
  const currentRow = `${instancesRowsSelector}:eq(${rowIndex})`;

  const isHana = isHanaInstance(instance);

  const columnIndexOffset = isHana ? 1 : 0;

  const healthBadgeSelector = `${currentRow} div[class*="cell"]:eq(0) svg`;
  const instanceNumberSelector = `${currentRow} div[class*="cell"]:eq(1)`;
  const featuresSelector = `${currentRow} div[class*="cell"]:eq(2)`;
  const hanaInstanceSelector = `${currentRow} div[class*="cell"]:eq(3)`;
  const clusterNameSelector = `${currentRow} div[class*="cell"]:eq(${
    3 + columnIndexOffset
  })`;
  const hostnameSelector = `${currentRow} div[class*="cell"]:eq(${
    4 + columnIndexOffset
  })`;

  const healthBadgeExpectedClass = healthMap[instance.health];
  cy.get(healthBadgeSelector).should('have.class', healthBadgeExpectedClass);

  const expectedInstanceNumber = instance.instanceNumber;
  cy.get(instanceNumberSelector).should('have.text', expectedInstanceNumber);

  const expectedFeatures = instance.features.replaceAll('|', '');
  cy.get(featuresSelector).should('have.text', expectedFeatures);

  if (isHana) {
    const expectedValue = `${instance.systemReplication} ${instance.systemReplicationStatus}`;
    cy.get(hanaInstanceSelector).should('have.text', expectedValue);
  }

  const clusterNameExpected =
    instance.clusterName === '' ? 'not available' : instance.clusterName;
  cy.get(clusterNameSelector).should('have.text', clusterNameExpected);

  const hostnameExpected = instance.hostname;
  cy.get(hostnameSelector).should('have.text', hostnameExpected);
};

export const instanceDataIsTheExpected = () => {
  clickAllRows();
  instancesData.forEach((instance, rowIndex) => {
    validateInstanceRowData(instance, rowIndex);
  });
};

export const eachHanaInstanceHasItsClusterWorkingLink = () => {
  const hanaInstances = instancesData.filter(
    (instance) => instance.clusterID !== ''
  );
  hanaInstances.forEach((hanaInstance, index) => {
    clickAllRows();
    cy.get('div[class*="table"] div[class*="table-row "]').should('be.visible');
    cy.pause();
    cy.get(`${hanaClusterLinks}:eq(${index})`).click();
    validateUrl(`/clusters/${hanaInstance.clusterID}`);
    cy.go('back');
  });
};

export const eachInstanceHasItsHostWorkingLink = () => {
  instancesData.forEach((instance, rowIndex) => {
    clickAllRows();
    cy.get(`${instanceHostLinks}:eq(${rowIndex})`).click();
    validateUrl(`/hosts/${instance.hostID}`);
    cy.go('back');
  });
};

export const javaSystemIsDiscoveredCorrectly = () => {
  const javaSystemRowSelector = `tbody tr:contains('${availableJavaSystem.sid}')`;
  cy.get(javaSystemRowSelector).should('be.visible');
  const javaSystemTypeSelector = `${javaSystemRowSelector} td:eq(5)`;
  cy.get(javaSystemTypeSelector).should('have.text', availableJavaSystem.type);
  tableDisplaysExpectedAmountOfSystems(4);
};

export const tableDisplaysExpectedAmountOfSystems = (systemsAmount) =>
  cy.get(sapSystemsTableRows).should('have.length', systemsAmount);

export const eachInstanceHasItsHealthStatusCorrectlyUpdated = () => {
  const sapSystemsFirstRow = `${sapSystemsTableRows}:eq(0)`;
  const collapsibleCell = `${sapSystemsFirstRow} > td:eq(0)`;
  cy.get(collapsibleCell).click();

  Object.entries(healthMap).forEach(([state, health], index) => {
    basePage.loadScenario(`sap-systems-overview-${state}`);

    const sapSystemInstanceHealthBadge = `${sapSystemsFirstRow} td:eq(1) svg`;
    cy.get(sapSystemInstanceHealthBadge).should('have.class', health);

    const appLayerInstanceHealthBadge = `${sapSystemsFirstRow} + tr td div[class*="row border"]:eq(${
      index + 1
    }) div[class*="cell"]:eq(0) svg`;
    cy.get(appLayerInstanceHealthBadge).should('have.class', health);
  });
};

export const sapSystemHealthChangesToRedAsExpected = () => {
  basePage.loadScenario('sap-systems-overview-hana-RED');

  const healthClass = healthMap['RED'];

  const sapSystemsFirstRow = `${sapSystemsTableRows}:eq(0)`;
  const collapsibleCell = `${sapSystemsFirstRow} > td:eq(0)`;
  cy.get(collapsibleCell).click();

  const sapSystemInstanceHealthBadge = `${sapSystemsFirstRow} td:eq(1) svg`;
  cy.get(sapSystemInstanceHealthBadge).should('have.class', healthClass);

  const appLayerInstanceHealthBadge =
    'tr td div[class*="flex bg-white"] div[class*="row"] div[class*="cell"] svg:eq(4)';
  cy.get(appLayerInstanceHealthBadge).should('have.class', healthClass);
};

export const sapDiagnosticsAgentDiscoveryVisualizationIsSkipped = () => {
  basePage.loadScenario('sap-systems-overview-DAA');
  cy.get('table[class*="table-fixed"]').should('not.contain', 'DAA');
};

export const systemNwdIsVisible = () =>
  cy.get(`td:contains('${sapSystemNwd.sid}')`).should('be.visible');

export const systemNwdIsNotDisplayed = () =>
  cy.get(`td:contains('${sapSystemNwd.sid}')`).should('not.exist');

export const cleanUpButtonIsNotDisplayed = () =>
  cy.get(cleanUpButton).should('not.exist');

export const cleanUpButtonIsDisplayed = () =>
  cy.get(cleanUpButton).should('be.visible');

export const cleanUpButonIsDisabled = () =>
  cy.get(cleanUpButton).should('be.disabled');

export const cleanUpButonIsEnabled = () =>
  cy.get(cleanUpButton).should('be.enabled');

export const existentTagCannotBeModified = () =>
  cy.get(existentEnv3Tag).should('have.class', 'opacity-50');

export const addTagButtonIsDisabled = () =>
  cy.get(addTagButton).should('have.class', 'opacity-50');

export const existentTagCanBeModified = () =>
  cy.get(existentEnv3Tag).should('not.have.class', 'opacity-50');

export const addTagButtonIsEnabled = () =>
  cy.get(addTagButton).should('not.have.class', 'opacity-50');

// API
export const deregisterInstance = () => {
  apiDeregisterInstance(
    sapSystemNwd.id,
    sapSystemNwd.hostId,
    sapSystemNwd.instanceNumber
  );
};

export const apiRemoveAllSapSystemsTags = () => {
  apiGetSapSystems().then((response) => {
    const sapSystemTags = getSapSystemTags(response.body);
    Object.entries(sapSystemTags).forEach(([clusterId, tags]) => {
      tags.forEach((tag) => apiRemoveTagBySapSystemId(clusterId, tag));
    });
  });
  return basePage.refresh();
};

const apiRemoveTagBySapSystemId = (systemId, tagId) => {
  return basePage.apiLogin().then(({ accessToken }) =>
    cy.request({
      url: `/api/v1/sap_systems/${systemId}/tags/${tagId}`,
      method: 'DELETE',
      auth: { bearer: accessToken },
    })
  );
};

const apiGetSapSystems = () => {
  return basePage.apiLogin().then(({ accessToken }) => {
    const url = '/api/v1/sap_systems';
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

const getSapSystemTags = (jsonData) => {
  const clusterTags = {};
  jsonData.forEach((cluster) => {
    if (cluster.tags && cluster.tags.length > 0) {
      clusterTags[cluster.id] = cluster.tags.map((tag) => tag.value);
    }
  });

  return clusterTags;
};

export const loadJavaScenario = () => {
  basePage.loadScenario('multi-tenant');
  basePage.loadScenario('java-system');
};

export const apiDeregisterJavaSystems = () =>
  availableJavaSystem.instances.forEach(({ hostID }) => {
    basePage.apiDeregisterHost(hostID);
  });

export const revertNotMovedScenario = () =>
  basePage.loadScenario('sap-systems-overview-revert-not-moved');

export const revertMovedScenario = () =>
  basePage.loadScenario('sap-systems-overview-revert-moved');

export const loadNotMovedScenario = () =>
  basePage.loadScenario('sap-systems-overview-not-moved');

export const loadMovedScenario = () =>
  basePage.loadScenario('sap-systems-overview-moved');

const apiDeregisterInstance = (sapSystemdId, hostId, instanceNumber) => {
  const [webAPIHost, webAPIPort] = [
    Cypress.env('web_api_host'),
    Cypress.env('web_api_port'),
  ];

  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
  };

  basePage.apiLogin().then(({ accessToken }) => {
    const url = `http://${webAPIHost}:${webAPIPort}/api/v1/sap_systems/${sapSystemdId}/hosts/${hostId}/instances/${instanceNumber}`;
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

export const apiDeregisterNwpHost = () =>
  basePage.apiDeregisterHost(sapSystemNwp.hanaPrimary.id);

export const apiDeregisterNwqHost = () =>
  basePage.apiDeregisterHost(sapSystemNwq.messageserverInstance.id);

export const apiDeregisterNwdInstances = () => {
  basePage.apiDeregisterHost(sapSystemNwd.applicationInstances[0].id);
  basePage.apiDeregisterHost(sapSystemNwd.applicationInstances[1].id);
};

export const restoreNwdHost = () =>
  basePage.loadScenario(`sapsystem-${sapSystemNwd.sid}-restore`);

export const loadAbsentInstanceScenario = () =>
  basePage.loadScenario(
    `sap-systems-overview-${sapSystemNwd.sid}-${sapSystemNwd.appInstance.instanceNumber}-absent`
  );

export const loadPresentInstanceScenario = () =>
  basePage.loadScenario(
    `sap-systems-overview-${sapSystemNwd.sid}-${sapSystemNwd.appInstance.instanceNumber}-present`
  );

export const loadAbsentMessageServerInstance = () =>
  basePage.loadScenario(
    `sap-systems-overview-${sapSystemNwd.sid}-${sapSystemNwd.messageserverInstance.instanceNumber}-absent`
  );

export const apiSetTagNwdSystem = () => apiSetTag(sapSystemNwd.sid, 'env3');

const apiSetTag = (systemSid, tag) => {
  const systemId = systemIdBySid(systemSid);
  return basePage.apiSetTag('sap_systems', systemId, tag);
};

const systemIdBySid = (systemName) =>
  availableSAPSystems.find(({ sid }) => sid === systemName).id;

export const apiCreateUserWithSapSystemTagsAbility = () =>
  basePage.apiCreateUserWithAbilities([
    { name: 'all', resource: 'sap_system_tags' },
  ]);

export const loadAppCleanUpPermissionsScenario = () => {
  basePage.loadScenario('sap-systems-overview-NWD-00-absent');
  basePage.loadScenario('sap-systems-overview-HDD-10-present');
};

export const loadDatabaseCleanUpPermissionsScenario = () => {
  basePage.loadScenario('sap-systems-overview-NWD-00-present');
  basePage.loadScenario('sap-systems-overview-HDD-10-absent');
};

export const apiCreateUserWithAppInstanceCleanUpAbility = () =>
  basePage.apiCreateUserWithAbilities([
    { name: 'cleanup', resource: 'application_instance' },
  ]);

export const apiCreateUserWithDatabaseCleanUpAbility = () =>
  basePage.apiCreateUserWithAbilities([
    { name: 'cleanup', resource: 'database_instance' },
  ]);
