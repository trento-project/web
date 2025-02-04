export * from './base-po.js';
import * as basePage from './base-po.js';

import { catalogCheckFactory } from '@lib/test-utils/factories';
import { groupBy } from 'lodash';

const url = '/catalog';
const checksCatalogEndpointAlias = 'checksCatalogRequest';

// Selectors
const checkGroups = 'div.check-group';
const groupNames = '.check-group > div > div > h3';
const checkRows = '.check-row';
const checkPanels = '.check-panel';

const targetIcon = 'div[aria-label="accordion-panel"] span span:nth-child(1)';

const providersSelectionDropdown = 'button.providers-selection-dropdown';
const targetsSelectionDropdown = 'button.targets-selection-dropdown';
const clusterTypesSelectionDropdown = 'button.cluster-types-selection-dropdown';

const dropdownSelectedIcon =
  '.absolute.inset-y-0.right-2.end-1.flex.items-center.pl-3.text-green-600';

const networkErrorLabel = 'p:contains("Network Error")';
const tryAgainButton = 'button:contains("Try again")';

// Test Data
const checksCatalogURL = '**/api/v3/checks/catalog';

const clusterChecksGroup = 'Group 1';
const group1Checks = 2;

const hostChecksGroup = 'Group 2';
const group2Checks = 4;

const genericGroup = 'Group 3';
const group3Checks = 2;

const checksInGroup = {
  [clusterChecksGroup]: group1Checks,
  [hostChecksGroup]: group2Checks,
  [genericGroup]: group3Checks,
};

const group1 = catalogCheckFactory.buildList(group1Checks, {
  group: clusterChecksGroup,
  metadata: { target_type: 'cluster', cluster_type: 'hana_scale_up' },
});
const group2 = catalogCheckFactory.buildList(group2Checks, {
  group: hostChecksGroup,
  metadata: { target_type: 'host' },
});
const group3 = catalogCheckFactory.buildList(group3Checks, {
  group: genericGroup,
});
const catalog = [...group1, ...group2, ...group3];

const selectFromCatalogDropdown = (dropdownElementSelector, choice) => {
  cy.get(dropdownElementSelector).click();
  cy.get(dropdownSelectedIcon).should('be.visible');
  return cy
    .get(`${dropdownElementSelector} + div div:contains("${choice}")`)
    .click();
};

export const visit = () => basePage.visit(url);

export const interceptChecksCatalogEndpoint = (forceError = false) => {
  let interceptArgument;
  if (forceError) {
    interceptArgument = { forceNetworkError: true };
  } else {
    interceptArgument = { body: { items: catalog } };
  }

  return cy
    .intercept(`${checksCatalogURL}**`, interceptArgument)
    .as(checksCatalogEndpointAlias);
};

export const interceptChecksCatalogEndpointWithError = () => {
  return interceptChecksCatalogEndpoint(true);
};

export const getCheckGroupsNames = () => {
  return Object.entries(groupBy(catalog, 'group')).map(([group]) => group);
};

export const expectedCheckGroupsAreDisplayed = () => {
  return cy.get(checkGroups).should('have.length', 3);
};

export const onlyFirstCheckGroupIsExpanded = () => {
  return cy.get(checkGroups).first().find(checkRows).should('have.length', 2);
};

export const expectedCheckGroupsAreIncluded = () => {
  const groups = getCheckGroupsNames();
  return groups.forEach((group) => cy.get(groupNames).should('contain', group));
};

export const eachGroupShouldBeExpanded = () => {
  expandAllGroups();
  return cy.get(groupNames).each((group, index) => {
    const groupText = group.text();
    return cy
      .get(checkGroups)
      .eq(index)
      .then((checkGroup) => {
        return cy
          .wrap(checkGroup)
          .find(checkRows)
          .should('have.length', checksInGroup[groupText]);
      });
  });
};

export const expandAllGroups = () => {
  return cy.get(groupNames).each((group, index) => {
    if (index !== 0) cy.wrap(group).click();
  });
};

export const clickFirstCheckRow = () => {
  return cy.get(checkRows).first().click();
};

export const selectFromProvidersDropdown = (choice) => {
  selectFromCatalogDropdown(providersSelectionDropdown, choice);
  return waitForChecksCatalogRequest().then((response) => response.request.url);
};

export const selectFromTargetsSelectionDropdown = (choice) => {
  selectFromCatalogDropdown(targetsSelectionDropdown, choice);
  return waitForChecksCatalogRequest().then((response) => response.request.url);
};

export const selectFromClusterTypesSelectionDropdown = (choice) => {
  selectFromCatalogDropdown(clusterTypesSelectionDropdown, choice);
  return waitForChecksCatalogRequest().then((response) => response.request.url);
};

export const waitForChecksCatalogRequest = () => {
  return basePage.waitForRequest(checksCatalogEndpointAlias);
};
export const networkErrorLabelIsDisplayed = () => {
  return cy.get(networkErrorLabel).should('be.visible');
};

export const tryAgainButtonIsDisplayed = () => {
  return cy.get(tryAgainButton).should('be.visible');
};

export const checkPanelHasTheExpectedText = () => {
  return cy
    .get(checkPanels)
    .first()
    .should('have.text', catalog[0].remediation);
};

export const eachGroupHasExpectedCheckIds = () => {
  expandAllGroups();
  const catalogIds = catalog.map((item) => item.id);

  return catalogIds.forEach((id) => {
    cy.get(`p:contains("${id}")`).should('be.visible');
  });
};

export const expectedTargetTypeClusterIconsAreDisplayed = () => {
  return cy
    .get(`h3:contains("${clusterChecksGroup}")`)
    .parents(checkGroups)
    .within(() => cy.get(targetIcon).should('have.length', group1Checks));
};

export const expectedTargetTypeHostIconsAreDisplayed = () => {
  cy.get(`h3:contains("${hostChecksGroup}")`)
    .parents(checkGroups)
    .within(() => cy.get(targetIcon).should('have.length', group2Checks));
};

export const checkPanelIsNotVisible = () => {
  return cy.get(checkPanels).should('not.exist');
};
