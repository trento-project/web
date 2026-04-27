export * from './base_po.js';
import * as basePage from './base_po.js';

// Test data

import {
  selectedSystem,
  attachedHosts,
  healthMap,
} from '../fixtures/sap-system-details/selected_system';

const hostToDeregister = {
  name: 'vmnwdev02',
  id: 'fb2c6b8a-9915-5969-a6b7-8b5a42de1971',
  features: 'ENQREP',
};

// Selectors

const sapSystemName = 'div[class="font-bold"]:contains("Name") + div span';
const sapSystemType = 'div[class="font-bold"]:contains("Type") + div span';
const notFoundLabel = 'div:contains("Not Found")';
const thirdRowStatusCellSelector =
  'div[class="mt-16"]:contains("Layout") table tbody tr:eq(2) td:eq(6)';
const hostToDeregisterName = `td a:contains("${hostToDeregister.name}")`;
const hostToDeregisterFeatures = `td:contains("${hostToDeregister.features}")`;
const cleanUpButton = 'button:contains("Clean up")';
const sapSystemsRows = 'div[class="mt-16"]:contains("Layout") table tbody tr';

// UI Interactions

export const visit = () => {
  cy.intercept('/api/v1/hosts').as('hostsEndpoint');
  basePage.visit(`/sap_systems/${selectedSystem.Id}`);
  return cy.wait('@hostsEndpoint');
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

export const layoutTableShowsExpectedData = () =>
  cy.wrap(selectedSystem.Hosts).each((instance, index) => {
    const keys = Object.keys(instance);
    return cy.wrap(keys).each((key, i) => {
      const tableCellSelector = `div[class="mt-16"]:contains("Layout") table tbody tr:eq(${index}) td:eq(${i})`;
      const rawExpectedValue = instance[key];
      const expectedValue = _getFormattedExpectedValue(key, rawExpectedValue);
      cy.get(tableCellSelector).should('have.text', expectedValue);

      if (key === 'Status') {
        return cy
          .get(`${tableCellSelector} svg`)
          .should('have.class', healthMap[instance.Status]);
      }
    });
  });

const _getFormattedExpectedValue = (key, value) => {
  if (key === 'Features') return value.replaceAll('|', '');
  else if (key === 'Status') return `SAPControl: ${value}`;
  else return value;
};

export const shouldDisplayExpectedHealthStatusChanges = () =>
  cy.wrap(Object.entries(healthMap)).each(([state, health]) => {
    basePage.loadScenario(`sap-system-detail-${state.toUpperCase()}`);
    cy.get(thirdRowStatusCellSelector).should(
      'have.text',
      `SAPControl: ${state}`
    );
    return cy
      .get(`${thirdRowStatusCellSelector} svg`)
      .should('have.class', health);
  });

export const eachHostHasTheExpectedLink = () =>
  cy.wrap(attachedHosts).each((host, index) => {
    const tableCellSelector = `div[class="mt-8"]:contains("Hosts") table tbody tr:eq(${index}) td:eq(0) a`;
    cy.get(tableCellSelector).click();
    basePage.validateUrl(`/hosts/${host.AgentId}`);
    return cy.go('back');
  });

export const eachHostHasTheExpectedData = () =>
  cy.wrap(attachedHosts).each((host, index) => {
    const keys = Object.keys(host).filter((key) => key !== 'AgentId');
    return cy.wrap(keys).each((key, rowIndex) => {
      const tableCellSelector = `div[class="mt-8"]:contains("Hosts") table tbody tr:eq(${index}) td:eq(${rowIndex})`;
      const expectedValue =
        key === 'Addresses' ? host[key].join('') : host[key];
      return cy.get(tableCellSelector).should('have.text', expectedValue);
    });
  });

export const hostToDeregisterIsDisplayed = () => {
  cy.get(hostToDeregisterName).should('be.visible');
  return cy.get(hostToDeregisterFeatures).should('be.visible');
};
export const hostToDeregisterIsNotDisplayed = () => {
  cy.get(hostToDeregisterName).should('not.exist');
  return cy.get(hostToDeregisterFeatures).should('not.exist');
};

export const cleanUpButtonIsEnabled = () =>
  cy.get(cleanUpButton).should('be.enabled');

export const cleanUpButtonIsDisabled = () =>
  cy.get(cleanUpButton).should('be.disabled');

export const newSapSystemIsDisplayed = () => {
  cy.get(sapSystemsRows).should('have.length', 5);
  cy.get('div:contains("sapnwdaas1")').should('be.visible');
  return cy.get('div:contains("99")').should('be.visible');
};

// API

export const restoreInstanceHealth = () =>
  basePage.loadScenario('sap-system-detail-GREEN');

export const apiDeregisterHost = () =>
  basePage.apiDeregisterHost(hostToDeregister.id);

export const restoreDeregisteredHost = () =>
  basePage.loadScenario(`host-${hostToDeregister.name}-restore`);

export const loadAbsentHostScenario = () =>
  basePage.loadScenario('sap-systems-overview-NWD-00-absent');

export const apiCreateUserWithApplicationCleanupAbility = () =>
  basePage.apiCreateUserWithAbilities([
    { name: 'cleanup', resource: 'application_instance' },
  ]);

export const loadNewSapSystem = () =>
  basePage.loadScenario('sap-system-detail-NEW');
