export * from './base_po.js';
import * as basePage from './base_po.js';

// Test data
const url = '/sap_systems';

import {
  availableSAPSystems,
  availableJavaSystem,
  isHanaInstace,
  isHanaPrimary,
  isHanaSecondary,
  healthMap,
} from '../fixtures/sap-systems-overview/available_sap_systems';
// Selectors

// UI Interactions
export const visit = () => basePage.visit(url);

// UI Validations

export const validateUrl = () => basePage.validateUrl(url);

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
// API
