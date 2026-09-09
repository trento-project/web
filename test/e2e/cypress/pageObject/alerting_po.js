// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

/* This page object handles alerting functionality.
It was created to keep alerting logic separate from other concerns, even though there is no dedicated "Alerting" page in the UI.*/

export * from './base_po';
import * as basePage from './base_po';

const alertingDevEnvSettings = {
  enabled: true,
  smtpServer: 'localhost',
  smtpPort: '1025',
  smtpUsername: 'trentouser',
  smtpPassword: 'pass',
  senderEmail: 'alerts@trento-project.io',
  recipientEmail: 'admin@trento-project.io',
};

const testHost = {
  id: '9cd46919-5f19-59aa-993e-cf3736c71053',
  hostname: 'vmhdbprd01',
};

// Selectors

const testEmailButton = '[aria-label="alerting-test-email-button"]';
const testEmailSentToaster = 'p:contains("Test email sent!")';
const testEmailFailedToaster = 'p:contains("Test email delivery failed!")';

export const apiSetDevEnvAlertingSettings = (
  method = 'POST',
  settings = alertingDevEnvSettings
) =>
  basePage.apiLogin().then(({ accessToken }) =>
    cy.request({
      url: '/api/v1/settings/alerting',
      method: method,
      auth: {
        bearer: accessToken,
      },
      body: {
        enabled: settings.enabled,
        smtp_server: settings.smtpServer,
        smtp_port: settings.smtpPort,
        smtp_username: settings.smtpUsername,
        smtp_password: settings.smtpPassword,
        sender_email: settings.senderEmail,
        recipient_email: settings.recipientEmail,
      },
    })
  );

export const apiSetDevEnvInvalidAlertingSettings = () =>
  apiSetDevEnvAlertingSettings('PATCH', { smtpPort: 1024 });

export const emailIsReceived = (type) =>
  cy
    .task('searchEmailInMailpit', { subject: `Trento Alert: ${type}` })
    .then((result) => cy.wrap(result.length).should('equal', 1));

export const emailIsNotReceived = (type) =>
  cy
    .task('searchEmailInMailpit', {
      subject: `Trento Alert: ${type}`,
      options: { retries: 0 },
    })
    .then((result) => cy.wrap(result.length).should('equal', 0));

export const heartbeatFailedEmailIsReceived = () =>
  emailIsReceived(`Host ${testHost.hostname} stopped reporting`);

export const triggerHeartbeatFailedAlertingEmail = () => {
  basePage.startAgentsHeartbeat([testHost.id]);
  return basePage.stopAgentsHeartbeat();
};

export const triggerHostAlertingEmail = () =>
  basePage.loadScenario('host-vmhdbprd01-saptune-not-compliant');

export const triggerClusterAlertingEmail = () => {
  basePage.loadScenario('cluster-unnamed');
  return basePage.loadScenario('cluster-1-SOK');
};

export const triggerSapSystemAlertingEmail = () =>
  basePage.loadScenario('sap-system-detail-RED');

export const triggerDatabaseAlertingEmail = () =>
  basePage.loadScenario('hana-database-detail-RED');

export const triggerTestEmail = () =>
  cy.get(testEmailButton).should('be.enabled').click();

export const testEmailSentToasterIsDisplayed = () =>
  cy.get(testEmailSentToaster).should('be.visible');

export const testEmailFailedToasterIsDisplayed = () =>
  cy.get(testEmailFailedToaster).should('be.visible');

export const deleteAllEmailsFromMailpit = () => {
  if (Cypress.expose('ALERTING_TESTS')) cy.task('deleteAllEmailsFromMailpit');
};
