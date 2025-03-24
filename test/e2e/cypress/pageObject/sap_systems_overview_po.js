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

// Selectors
const sapSystemsTableRows = 'tbody tr[class*="pointer"]';

// UI Interactions
export const visit = () => {
  cy.intercept('/api/v1/databases').as('databasesRequest');
  cy.intercept('/api/v1/sap_systems').as('sapSystemsRequest');
  basePage.visit(url);
  cy.wait('@databasesRequest');
};

export const tagSapSystems = () => {
  availableSAPSystems.forEach(({ sid, tag }) => {
    basePage.addTagByColumnValue(sid, tag);
  });
};

// UI Validations

export const validateUrl = (_url = url) => basePage.validateUrl(_url);

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
    const healthCellSelector = `tbody tr:eq(${index}) td:eq(0) svg`;
    cy.get(healthCellSelector).should('have.class', healthClass);
  });
};

export const eachAttachedDatabaseDetailsAreTheExpected = () => {
  const tableCell = (rowIndex, columnIndex) =>
    `tbody tr[class*="cursor"]:eq(${rowIndex}) td:eq(${columnIndex})`;

  availableSAPSystems.forEach(
    ({ attachedDatabase: attachedDatabase, type: type }, rowIndex) => {
      cy.get(tableCell(rowIndex, 2)).should('have.text', attachedDatabase.sid);
      cy.get(tableCell(rowIndex, 3)).should(
        'have.text',
        attachedDatabase.tenant
      );
      cy.get(tableCell(rowIndex, 4)).should('have.text', type);
      cy.get(tableCell(rowIndex, 5)).should(
        'have.text',
        attachedDatabase.dbAddress
      );
    }
  );
};

export const eachSystemHasItsDatabaseWorkingLink = () => {
  availableSAPSystems.forEach(
    ({ attachedDatabase: attachedDatabase }, index) => {
      const databaseSidLink = `tr[class*="cursor"]:eq(${index}) td:contains("${attachedDatabase.sid}") a`;
      cy.get(databaseSidLink).click();
      validateUrl(`/databases/${attachedDatabase.id}`);
      cy.go('back');
    }
  );
};

export const eachInstanceDetailsAreTheExpected = () => {
  availableSAPSystems.forEach(({ instances }, instanceIndex) => {
    const tableRow = `tbody tr[class*="cursor"]:eq(${instanceIndex})`;
    cy.get(tableRow).click();

    instances.forEach((instance, rowIndex) => {
      const isHana = isHanaInstance(instance);

      // If is HANA instance index must be increased to skip instances table headers
      let isHanaInstancesHeader = false;
      if (!isHanaInstancesHeader && isHana) {
        rowIndex = isHana ? rowIndex + 1 : rowIndex;
        isHanaInstancesHeader = true;
      }

      const expandedTableRowCells = `${tableRow} + tr div[class*="row border"]:eq(${
        rowIndex + 1
      }) div[class*="cell"]`;

      const columnIndexOffset = isHana ? 1 : 0;
      const healthBadgeSelector = `${expandedTableRowCells}:eq(0) svg`;
      const instanceNumberSelector = `${expandedTableRowCells}:eq(1)`;
      const featuresSelector = `${expandedTableRowCells}:eq(2)`;
      const hanaInstanceSelector = `${expandedTableRowCells}:eq(3)`;
      const clusterNameSelector = `${expandedTableRowCells}:eq(${
        3 + columnIndexOffset
      })`;
      const hostnameSelector = `${expandedTableRowCells}:eq(${
        4 + columnIndexOffset
      })`;

      const healthBadgeExpectedClass = healthMap[instance.health];
      cy.get(healthBadgeSelector).should(
        'have.class',
        healthBadgeExpectedClass
      );

      const expectedInstanceNumber = instance.instanceNumber;
      cy.get(instanceNumberSelector).should(
        'have.text',
        expectedInstanceNumber
      );

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
    });
    cy.get(tableRow).click();
  });
};

export const eachSapSystemHasWorkingLinkToKnownTypeCluster = () => {
  availableSAPSystems.forEach(({ instances }, instanceIndex) => {
    const tableRow = `tbody tr[class*="cursor"]:eq(${instanceIndex})`;
    cy.get(tableRow).click();

    instances.forEach((instance, rowIndex) => {
      const isHana = isHanaInstance(instance);

      // If is HANA instance index must be increased to skip instances table headers
      let isHanaInstancesHeader = false;
      if (!isHanaInstancesHeader && isHana) {
        rowIndex = isHana ? rowIndex + 1 : rowIndex;
        isHanaInstancesHeader = true;
      }

      const expandedTableRowCells = `${tableRow} + tr div[class*="row border"]:eq(${
        rowIndex + 1
      }) div[class*="cell"]`;

      const columnIndexOffset = isHana ? 1 : 0;
      const clusterNameSelector = `${expandedTableRowCells}:eq(${
        3 + columnIndexOffset
      })`;

      if (isHana) {
        cy.get(clusterNameSelector).click();
        validateUrl(`/clusters/${instance.clusterID}`);
        cy.go('back');
      }
      cy.get(tableRow).click();
    });
  });
};

export const eachInstanceHasItsHostWorkingLink = () => {
  availableSAPSystems.forEach(({ instances }, instanceIndex) => {
    const tableRow = `tbody tr[class*="cursor"]:eq(${instanceIndex})`;

    instances.forEach((instance, rowIndex) => {
      cy.get(tableRow).click();
      const isHana = isHanaInstance(instance);

      // If is HANA instance index must be increased to skip instances table headers
      let isHanaInstancesHeader = false;
      if (!isHanaInstancesHeader && isHana) {
        rowIndex = isHana ? rowIndex + 1 : rowIndex;
        isHanaInstancesHeader = true;
      }

      const expandedTableRowCells = `${tableRow} + tr div[class*="row border"]:eq(${
        rowIndex + 1
      }) div[class*="cell"]`;

      const columnIndexOffset = isHana ? 1 : 0;
      const hostnameSelector = `${expandedTableRowCells}:eq(${
        4 + columnIndexOffset
      }) a`;

      cy.get(hostnameSelector).click();
      validateUrl(`/hosts/${instance.hostID}`);
      cy.go('back');
    });
  });
};

export const javaSystemIsDiscoveredCorrectly = () => {
  const javaSystemRowSelector = `tbody tr:contains('${availableJavaSystem.sid}')`;
  cy.get(javaSystemRowSelector).should('be.visible');
  const javaSystemTypeSelector = `${javaSystemRowSelector} td:eq(4)`;
  cy.get(javaSystemTypeSelector).should('have.text', availableJavaSystem.type);
  tableDisplaysExpectedAmountOfSystems(4);
};

export const tableDisplaysExpectedAmountOfSystems = (systemsAmount) =>
  cy.get(sapSystemsTableRows).should('have.length', systemsAmount);

export const eachInstanceHasItsHealthStatusCorrectlyUpdated = () => {
  const sapSystemsFirstRow = `${sapSystemsTableRows}:eq(0)`;
  cy.get(sapSystemsFirstRow).click();

  Object.entries(healthMap).forEach(([state, health], index) => {
    basePage.loadScenario(`sap-systems-overview-${state}`);

    const sapSystemInstanceHealthBadge = `${sapSystemsFirstRow} td:eq(0) svg`;
    cy.get(sapSystemInstanceHealthBadge).should('have.class', health);

    const appLayerInstanceHealthBadge = `${sapSystemsFirstRow} + tr td div[class*="row border"]:eq(${
      index + 1
    }) div[class*="cell"]:eq(0) svg`;
    cy.get(appLayerInstanceHealthBadge).should('have.class', health);
  });
};
// API
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
// Helpers
