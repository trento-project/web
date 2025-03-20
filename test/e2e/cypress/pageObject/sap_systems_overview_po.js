export * from './base_po.js';
import * as basePage from './base_po.js';

// Test data
const url = '/sap_systems';

import {
  availableSAPSystems,
  availableJavaSystem,
  isHanaInstance,
  isHanaPrimary,
  isHanaSecondary,
  healthMap,
} from '../fixtures/sap-systems-overview/available_sap_systems';
// Selectors

// UI Interactions
export const visit = () => {
  cy.intercept('/api/v1/databases').as('databasesRequest');
  basePage.visit(url);
  cy.wait('@databasesRequest');
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
  availableSAPSystems.forEach(({ instances }, index) => {
    const tableRow = `tbody tr[class*="cursor"]:eq(${index})`;
    cy.get(tableRow).click();

    instances.forEach((instance, instanceIndex) => {
      const expandedTableRowCells = `${tableRow} + tr div[class="table-row border-b"]:eq(${
        instanceIndex + 1
      }) div[class*="cell"]`;

      const healthBadgeSelector = `${expandedTableRowCells}:eq(0) svg`;
      const instanceNumberSelector = `${expandedTableRowCells}:eq(1)`;
      const featuresSelector = `${expandedTableRowCells}:eq(2)`;
      const clusterNameSelector = `${expandedTableRowCells}:eq(3)`;
      const hostnameSelector = `${expandedTableRowCells}:eq(4)`;

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

      const clusterNameExpected =
        instance.clusterName === '' ? 'not available' : instance.clusterName;
      cy.get(clusterNameSelector).should('have.text', clusterNameExpected);

      const hostnameExpected = instance.hostname;
      cy.get(hostnameSelector).should('have.text', hostnameExpected);
    });
    cy.get(tableRow).click();
  });
};
// API

// Helpers
