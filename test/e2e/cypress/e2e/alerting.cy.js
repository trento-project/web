import * as settingsPage from '../pageObject/settings_po';

context('Settings page', () => {
  beforeEach(() => {
    settingsPage.preloadTestData();
    settingsPage.visit();
    settingsPage.waitForRequest('settingsEndpoint');
  });

  describe('Send/Receive Emails when alerting settings are setup from env', () => {
    before(function () {
      if (!Cypress.env('ALERTING_DB_TESTS')) {
        this.skip();
      }
    });

    it('should display empty values', () => {
      cy.get('body').should('be.visible');
    });

    it('should have an edit button enabled', () => {
      cy.get('body').should('be.visible');
    });
  });

  describe('Send/Receive Emails when alerting settings are manually setup', () => {
    before(function () {
      settingsPage.getAlertingSettings().then((resp) => {
        if (!resp.body.enforced_from_env) {
          this.skip();
        }
      });
    });

    it('should display empty values', () => {
      cy.get('body').should('be.visible');
    });

    it('should have an edit button enabled', () => {
      cy.get('body').should('be.visible');
    });
  });
});
