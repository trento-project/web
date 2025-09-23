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
    it('Send email when agent heartbeat is lost', () => {
      settingsPage.startAgentHeartbeat();
      settingsPage.stopAgentsHeartbeat();
      settingsPage
        .emailExistsInMailpit('	Trento Alert: Host vmhdbprd01 needs attention.')
        .then((result) => cy.wrap(result).should('be.true'));
    });
  });
});
