// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import * as alertingPage from '../pageObject/alerting_po';

context('Email Alerting feature', () => {
  before(function () {
    if (!Cypress.expose('ALERTING_TESTS')) {
      this.skip();
    }
    alertingPage.preloadTestData();
    alertingPage.deleteAllEmailsFromMailpit();
    alertingPage.getAlertingSettings().then((resp) => {
      if (resp.status === 404 || resp.body.enforced_from_env === false) {
        const requestMethod = resp.status === 404 ? 'POST' : 'PATCH';
        alertingPage.apiSetDevEnvAlertingSettings(requestMethod);
      }
    });
  });

  describe('Receive alerting emails when specific actions trigger them', () => {
    it('Receive email when host health goes critical', () => {
      alertingPage.triggerHostAlertingEmail();
      alertingPage.emailIsReceived('host');
    });

    it('Receive email when cluster health goes critical', () => {
      alertingPage.triggerClusterAlertingEmail();
      alertingPage.emailIsReceived('cluster');
    });

    it('Receive email when SAP System health goes critical', () => {
      alertingPage.triggerSapSystemAlertingEmail();
      alertingPage.emailIsReceived('sap system');
    });

    it('Receive email when Database health goes critical', () => {
      alertingPage.triggerDatabaseAlertingEmail();
      alertingPage.emailIsReceived('database');
    });

    it('Receive email when the host heartbeat fails', () => {
      alertingPage.triggerHeartbeatFailedAlertingEmail();
      alertingPage.heartbeatFailedEmailIsReceived();
    });
  });

  describe('Test email', () => {
    beforeEach(() => {
      alertingPage.deleteAllEmailsFromMailpit();
      alertingPage.apiSetDevEnvAlertingSettings('PATCH');
    });

    it('should not receive an email when alerting settings configuration is wrong and test email is requested', () => {
      alertingPage.apiSetDevEnvInvalidAlertingSettings();
      alertingPage.visit('/settings');
      alertingPage.triggerTestEmail();
      alertingPage.testEmailFailedToasterIsDisplayed();
      alertingPage.emailIsNotReceived('Test email');
    });

    it('should receive an email when alerting settings are properly configured and test email is requested', () => {
      alertingPage.visit('/settings');
      alertingPage.triggerTestEmail();
      alertingPage.testEmailSentToasterIsDisplayed();
      alertingPage.emailIsReceived('Test email');
    });
  });

  after(() => alertingPage.deleteAllEmailsFromMailpit());
});
