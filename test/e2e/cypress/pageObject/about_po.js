// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import semver from 'semver';

export * from './base_po';
import * as basePage from './base_po';

const hostToDeregister = '7269ee51-5007-5849-aaa7-7c4a98b0c9ce';

const url = '/about';
const pageTitle = 'h2';
const versionLabels = {
  server: 'div.font-bold:contains("Server version") + div span',
  wanda: 'div.font-bold:contains("Wanda version") + div span',
  checks: 'div.font-bold:contains("Checks version") + div span',
  postgres: 'div.font-bold:contains("PostgreSQL version") + div span',
  rabbitmq: 'div.font-bold:contains("RabbitMQ version") + div span',
  prometheus: 'div.font-bold:contains("Prometheus version") + div span',
};

const githubRepositoryLabel =
  'div.font-bold:contains("GitHub repository") + div a';
const amountOfSlesForSapSubscriptionsLabel =
  'div.font-bold:contains("SLES for SAP subscriptions") + div span';
const versionFilePath = '../../VERSION';

const expectedSemverVersionIsDisplayed = (versionLabel) =>
  cy
    .get(versionLabel)
    .invoke('text')
    .should((version) => {
      const isValidVersion = semver.valid(semver.coerce(version)) !== null;
      expect(isValidVersion, `expected "${version}" to be a valid semver`).to.be
        .true;
    });

export const visit = () => basePage.visit(url);

export const pageTitleIsDisplayed = () =>
  cy.get(pageTitle).should('have.text', 'About Trento Console');

export const expectedServerVersionIsDisplayed = () =>
  Cypress.expose('web_mode') === 'prod'
    ? expectedSemverVersionIsDisplayed(versionLabels.server)
    : cy.readFile(versionFilePath, 'utf8').then((expectedVersion) => {
        expectedVersion = expectedVersion.trim();

        return cy
          .get(versionLabels.server)
          .should('have.text', expectedVersion);
      });

export const expectedGithubUrlIsDisplayed = () =>
  cy
    .get(githubRepositoryLabel)
    .should('have.text', 'https://github.com/trento-project/web');

export const expectedComponentVersionIsDisplayed = (component) =>
  expectedSemverVersionIsDisplayed(versionLabels[component]);

export const expectedSlesForSapSubscriptionsAreDisplayed = (subscriptions) =>
  cy
    .get(amountOfSlesForSapSubscriptionsLabel)
    .should('have.text', `${subscriptions} found`);

export const apiDeregisterHost = () =>
  basePage.apiDeregisterHost(hostToDeregister);
