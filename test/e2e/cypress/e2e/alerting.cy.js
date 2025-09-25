import * as settingsPage from '../pageObject/settings_po';

context('Email Alerting feature', () => {
  before(function () {
    if (!Cypress.env('ALERTING_DB_TESTS')) {
      this.skip();
    }
    cy.task('deleteAllEmailsFromMailpit');
    settingsPage.preloadTestData();
    settingsPage.getAlertingSettings().then((resp) => {
      if (resp.status === 404 || resp.body.enforced_from_env === false) {
        const requestMethod = resp.status === 404 ? 'POST' : 'PATCH';
        settingsPage.apiSetDevEnvAlertingSettings(requestMethod);
      }
    });
  });

  describe('Receive alerting emails when specific actions trigger them', () => {
    it('Receive email when host health goes critical', () => {
      settingsPage.triggerHostAlertingEmail();
      settingsPage.emailIsReceived('host');
    });

    it('Receive email when cluster health goes critical', () => {
      settingsPage.triggerClusterAlertingEmail();
      settingsPage.emailIsReceived('cluster');
    });

    it('Receive email when SAP System health goes critical', () => {
      settingsPage.triggerSapSystemAlertingEmail();
      settingsPage.emailIsReceived('sap system');
    });

    it('Receive email when Database health goes critical', () => {
      settingsPage.triggerDatabaseAlertingEmail();
      settingsPage.emailIsReceived('database');
    });
  });

  after(() => cy.task('deleteAllEmailsFromMailpit'));
});
