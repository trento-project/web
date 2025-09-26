import * as alertingPage from '../pageObject/alerting_po';

context('Email Alerting feature', () => {
  before(function () {
    if (!Cypress.env('ALERTING_DB_TESTS')) {
      this.skip();
    }
    alertingPage.deleteAllEmailsFromMailpit();
    alertingPage.preloadTestData();
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
  });

  after(() => alertingPage.deleteAllEmailsFromMailpit());
});
