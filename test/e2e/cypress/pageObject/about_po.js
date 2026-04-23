export * from './base_po';
import * as basePage from './base_po';

const hostToDeregister = '7269ee51-5007-5849-aaa7-7c4a98b0c9ce';

const url = '/about';
const pageTitle = 'h2';
const versionLabel = 'div:contains("Server version") + div span';
const githubRepositoryLabel = 'div:contains("GitHub repository") + div a';
const amountOfSlesForSapSubscriptionsLabel =
  'div:contains("SLES for SAP subscriptions") + div span';
const versionFilePath = '../../VERSION';

export const visit = () => basePage.visit(url);

export const pageTitleIsDisplayed = () =>
  cy.get(pageTitle).should('have.text', 'About Trento Console');

export const expectedServerVersionIsDisplayed = () =>
  cy.readFile(versionFilePath, 'utf8').then((version) => {
    version = version.trim();
    return cy.get(versionLabel).should('have.text', version);
  });

export const expectedGithubUrlIsDisplayed = () =>
  cy
    .get(githubRepositoryLabel)
    .should('have.text', 'https://github.com/trento-project/web');

export const expectedSlesForSapSubscriptionsAreDisplayed = (subscriptions) =>
  cy
    .get(amountOfSlesForSapSubscriptionsLabel)
    .should('have.text', `${subscriptions} found`);

export const apiDeregisterHost = () => {
  basePage.apiDeregisterHost(hostToDeregister);
};
