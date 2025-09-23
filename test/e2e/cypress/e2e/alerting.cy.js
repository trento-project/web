import * as settingsPage from '../pageObject/settings_po';
import * as clustersOverviewPage from '../pageObject/clusters_overview_po';

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
      settingsPage.startAgentHeartbeat();
      settingsPage.stopAgentsHeartbeat();
      settingsPage
        .emailExistsInMailpit('Trento Alert: Host vmhdbprd01 needs attention.')
        .then((result) => cy.wrap(result).should('be.true'));
    });

    it('Receive email when cluster health goes critical', () => {
      clustersOverviewPage.loadScenario('cluster-unnamed');
      clustersOverviewPage.loadScenario('cluster-1-SOK');
      settingsPage
        .emailExistsInMailpit('Cluster hana_cluster_1 needs attention')
        .then((result) => cy.wrap(result).should('be.true'));
    });

    it.skip('Receive email when SAP System health goes critical', () => {});

    it.skip('Receive email when Database health goes critical', () => {});
  });
});
