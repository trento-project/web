export * from './base_po.js';
import * as basePage from './base_po.js';

// Test data

import {
  selectedSystem,
  attachedHosts,
  healthMap,
} from '../fixtures/sap-system-details/selected_system';

// Selectors

const sapSystemName = 'div[class="font-bold"]:contains("Name") + div span';
const sapSystemType = 'div[class="font-bold"]:contains("Type") + div span';
const notFoundLabel = 'div:contains("Not Found")';
const thirdRowStatusCellSelector =
  'div:contains("Layout") table tbody tr:eq(2) td:eq(6)';

// UI Interactions

export const visit = () => {
  cy.intercept('/api/v1/hosts').as('hostsEndpoint');
  basePage.visit(`/sap_systems/${selectedSystem.Id}`);
  cy.wait('@hostsEndpoint');
};
export const visitNonExistentSapSystem = () =>
  basePage.visit('/sap_systems/other', { failOnStatusCode: false });

// UI Validations

export const validatePageUrl = (systemId = selectedSystem.Id) =>
  basePage.validateUrl(`/sap_systems/${systemId}`);

export const sapSystemHasExpectedName = () =>
  cy.get(sapSystemName).should('have.text', selectedSystem.Sid);

export const sapSystemHasExpectedType = () =>
  cy.get(sapSystemType).should('have.text', selectedSystem.Type);

export const notFoundLabelIsDisplayed = () =>
  cy.get(notFoundLabel).should('be.visible');

export const layoutTableShowsExpectedData = () => {
  selectedSystem.Hosts.forEach((instance, index) => {
    const keys = Object.keys(instance);

    for (let i = 0; i < keys.length; i++) {
      const tableCellSelector = `div:contains("Layout") table tbody tr:eq(${index}) td:eq(${i})`;
      const key = keys[i];
      const rawExpectedValue = instance[key];
      const expectedValue = _getFormattedExpectedValue(key, rawExpectedValue);

      cy.get(tableCellSelector).should('have.text', expectedValue);
      if (key === 'Status')
        cy.get(`${tableCellSelector} svg`).should(
          'have.class',
          healthMap[instance.Status]
        );
    }
  });
};

const _getFormattedExpectedValue = (key, value) => {
  if (key === 'Features') return value.replaceAll('|', '');
  else if (key === 'Status') return `SAPControl: ${value}`;
  else return value;
};

export const shouldDisplayExpectedHealthStatusChanges = () => {
  Object.entries(healthMap).forEach(([state, health]) => {
    basePage.loadScenario(`sap-system-detail-${state.toUpperCase()}`);
    cy.get(thirdRowStatusCellSelector).should(
      'have.text',
      `SAPControl: ${state}`
    );
    cy.get(`${thirdRowStatusCellSelector} svg`).should('have.class', health);
  });
};

export const eachHostHasTheExpectedLink = () => {
  attachedHosts.forEach((host, index) => {
    const tableCellSelector = `div[class="mt-8"]:contains("Hosts") table tbody tr:eq(${index}) td:eq(0) a`;
    cy.get(tableCellSelector).click();
    basePage.validateUrl(`/hosts/${host.AgentId}`);
    cy.go('back');
  });
};

export const eachHostHasTheExpectedData = () => {
  attachedHosts.forEach((host, index) => {
    delete host.AgentId;
    const keys = Object.keys(host);
    keys.forEach((key, rowIndex) => {
      const tableCellSelector = `div[class="mt-8"]:contains("Hosts") table tbody tr:eq(${index}) td:eq(${rowIndex})`;
      const expectedValue =
        key === 'Addresses' ? host[key].join('') : host[key];
      cy.get(tableCellSelector).should('have.text', expectedValue);
    });
  });
};

// API

export const restoreInstanceHealth = () =>
  basePage.loadScenario('sap-system-detail-GREEN');
