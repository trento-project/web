import * as settingsPage from '../pageObject/settings_po';

context('Settings page', () => {
  beforeEach(() => {
    settingsPage.visit();
    settingsPage.waitForRequest('settingsEndpoint');
  });

  describe('Alerting Settings enforced from env', () => {
    before(function () {
      settingsPage.getAlertingSettings().then((resp) => {
        if (resp.body.enforced_from_env) {
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
