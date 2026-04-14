export * from './base_po';
import * as basePage from './base_po';
import { getValue } from '../support/common.js';

const url = '/about';
const pageTitle = 'h2';
const versionLabel = 'div:contains("Server version") + div span';
const githubRepositoryLabel = 'div:contains("GitHub repository") + div a';
const amountOfSlesForSapSubscriptionsLabel =
  'div:contains("SLES for SAP subscriptions") + div span';
const versionFilePath = '../../VERSION';

export const visit = () => basePage.visit(url);

export const pageTitleIsDisplayed = () => {
  return cy.get(pageTitle).should('have.text', 'About Trento Console');
};

export const expectedServerVersionIsDisplayed = () => {
  return cy.readFile(versionFilePath, 'utf8').then((version) => {
    version = version.trim();
    return cy.get(versionLabel).should('have.text', version);
  });
};

export const expectedGithubUrlIsDisplayed = () => {
  return cy
    .get(githubRepositoryLabel)
    .should('have.text', 'https://github.com/trento-project/web');
};

export const expectedSlesForSapSubscriptionsAreDisplayed = () => {
  // The logic to increase expected subscriptions by one should be removed once TRNT-4343 is done.
  const expectedNumberOfSubscriptions =
    getValue('subscriptions') +
    (Cypress.config().baseUrl.includes('target') ? 1 : 0);

  return cy
    .get(amountOfSlesForSapSubscriptionsLabel)
    .should('have.text', `${expectedNumberOfSubscriptions} found`);
};
