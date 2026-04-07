export * from './base_po';
import * as basePage from './base_po';

const hostToDeregister = '7269ee51-5007-5849-aaa7-7c4a98b0c9ce';

const url = '/about';
const pageTitle = 'h2';
const versionLabel = 'div.font-bold:contains("Server version") + div span';
const wandaVersionLabel = 'div.font-bold:contains("Wanda version") + div span';
const postgresVersionLabel =
  'div.font-bold:contains("PostgreSQL version") + div span';
const rabbitmqVersionLabel =
  'div.font-bold:contains("RabbitMQ version") + div span';
const prometheusVersionLabel =
  'div.font-bold:contains("Prometheus version") + div span';
const githubRepositoryLabel =
  'div.font-bold:contains("GitHub repository") + div a';
const amountOfSlesForSapSubscriptionsLabel =
  'div.font-bold:contains("SLES for SAP subscriptions") + div span';
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

export const componentVersionIsDisplayed = (selector) => {
  return cy.get(selector).should('not.be.empty').and('be.visible');
};

export const expectedWandaVersionIsDisplayed = () => {
  return componentVersionIsDisplayed(wandaVersionLabel);
};

export const expectedPostgresVersionIsDisplayed = () => {
  return componentVersionIsDisplayed(postgresVersionLabel);
};

export const expectedRabbitmqVersionIsDisplayed = () => {
  return componentVersionIsDisplayed(rabbitmqVersionLabel);
};

export const expectedPrometheusVersionIsDisplayed = () => {
  return componentVersionIsDisplayed(prometheusVersionLabel);
};

export const expectedSlesForSapSubscriptionsAreDisplayed = () => {
  const subscriptions = getValue('subscriptions');
  return cy
    .get(amountOfSlesForSapSubscriptionsLabel)
    .should('have.text', `${subscriptions} found`);
}

export const apiDeregisterHost = () =>
  basePage.apiDeregisterHost(hostToDeregister);
