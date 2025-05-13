export * from './base_po';
import * as basePage from './base_po';
import { getValue } from '../support/common.js';

const url = '/about';
const pageTitle = 'h2';
const versionLabel = 'div:contains("Server version") + div span';
const githubRepositoryLabel = 'div:contains("GitHub repository") + div a';
const amountOfSlesForSapSubscriptionsLabel =
  'div:contains("SLES for SAP subscriptions") + div span';
const versionFilePath = '../../../../VERSION'

export const visit = () => basePage.visit(url);

export const pageTitleIsDisplayed = () => {
  return cy.get(pageTitle).should('have.text', 'About Trento Console');
};

export const expectedServerVersionIsDisplayed = () => {
  return cy.readFile(versionFilePath, 'utf8').then((version) => {
    const version = version.trim();
    cy.get(versionLabel).should('have.text', version);
  });
};

export const expectedGithubUrlIsDisplayed = () => {
  return cy
    .get(githubRepositoryLabel)
    .should('have.text', 'https://github.com/trento-project/web');
};

export const expectedSlesForSapSubscriptionsAreDisplayed = () => {
  const subscriptions = getValue('subscriptions');
  return cy
    .get(amountOfSlesForSapSubscriptionsLabel)
    .should('have.text', `${subscriptions} found`);
};
