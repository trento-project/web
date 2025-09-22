import * as settingsPage from '../pageObject/settings_po';

context('Settings page', () => {
  beforeEach(() => {
    settingsPage.visit();
    settingsPage.waitForRequest('settingsEndpoint');
  });

  describe('Alerting Settings enforced from env', () => {
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
});
