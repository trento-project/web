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

export const apiSetDevEnvAlertingSettings = (method = 'POST') => {
  basePage.apiLogin().then(({ accessToken }) => {
    cy.request({
      url: '/api/v1/settings/alerting',
      method: method,
      auth: {
        bearer: accessToken,
      },
      body: {
        enabled: alertingDevEnvSettings.enabled,
        smtp_server: alertingDevEnvSettings.smtpServer,
        smtp_port: alertingDevEnvSettings.smtpPort,
        smtp_username: alertingDevEnvSettings.smtpUsername,
        smtp_password: alertingDevEnvSettings.smtpPassword,
        sender_email: alertingDevEnvSettings.senderEmail,
        recipient_email: alertingDevEnvSettings.recipientEmail,
      },
    });
  });
};

export const emailIsReceived = (type) => {
  cy.task('searchEmailInMailpit', `Trento Alert: ${type}`).then((result) => {
    cy.wrap(result.length).should('equal', 1);
  });
};

export const triggerHostAlertingEmail = () => {
  cy.task('startAgentHeartbeat', ['9cd46919-5f19-59aa-993e-cf3736c71053']);
  basePage.stopAgentsHeartbeat();
};

export const triggerClusterAlertingEmail = () => {
  basePage.loadScenario('cluster-unnamed');
  basePage.loadScenario('cluster-1-SOK');
};

export const triggerSapSystemAlertingEmail = () =>
  basePage.loadScenario('sap-system-detail-RED');

export const triggerDatabaseAlertingEmail = () =>
  basePage.loadScenario('hana-database-detail-RED');

export const deleteAllEmailsFromMailpit = () =>
  cy.task('deleteAllEmailsFromMailpit');
