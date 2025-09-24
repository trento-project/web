import * as settingsPage from '../pageObject/settings_po';

context('Settings page', () => {
  before(function () {
    if (!Cypress.env('ALERTING_DB_TESTS')) {
      this.skip();
    }
    settingsPage.preloadTestData();
    settingsPage.getAlertingSettings().then((resp) => {
      if (resp.status === 404 || !resp.body.enforced_from_env) {
        const method = resp.status === 404 ? 'POST' : 'PATCH';
        settingsPage.apiSetDevEnvAlertingSettings(method);
      }
    });
  });

  describe('Send/Receive alerting emails when specific actions trigger them', () => {
    it('Receive email when host health goes critical', () => {
      settingsPage.triggerHostAlertingEmail();
      settingsPage.emailIsReceived('Trento Alert: Host');
    });

    it('Receive email when cluster health goes critical', () => {
      settingsPage.triggerClusterAlertingEmail();
      settingsPage.emailIsReceived('Trento Alert: Cluster');
    });

    it('Receive email when SAP System health goes critical', () => {
      settingsPage.loadScenario('sap-system-detail-RED');
      settingsPage.emailIsReceived('Trento Alert: Sap System');
    });

    it('Receive email when Database health goes critical', () => {
      settingsPage.loadScenario('hana-database-detail-RED');
      settingsPage.emailIsReceived('Trento Alert: Database');
    });
  });
});
