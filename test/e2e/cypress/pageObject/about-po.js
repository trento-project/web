export * from './base-po.js';
import * as basePage from './base-po.js';
import { getValue } from '../support/common';

const url = '/about';
const pageTitle = 'h2';
const versionLabel = 'div:contains("Server version") + div span';
const githubRepositoryLabel = 'div:contains("GitHub repository") + div a';
const amountOfSlesForSapSubscriptionsLabel =
  'div:contains("SLES for SAP subscriptions") + div span';

export const visit = (_url = url) => {
  return basePage.visit(_url);
};

export const pageTitleIsDisplayed = () => {
  return cy.get(pageTitle).should('have.text', 'About Trento Console');
};

export const expectedServerVersionIsDisplayed = () => {
  const { version } = require('./../../package.json');
  return cy.get(versionLabel).should('have.text', version);
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
