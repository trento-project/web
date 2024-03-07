/* eslint-disable cypress/no-unnecessary-waiting */
import { subDays, addDays } from 'date-fns';

context('Settings page', () => {
  before(() => {
    cy.visit('/settings');
  });

  after(() => {
    cy.updateApiKeyExpiration(null);
  });

  describe('Api key expiration notifications', () => {
    it('should show api key expired notification when first loading the page, when the api key is expired', () => {
      cy.updateApiKeyExpiration(subDays(new Date(), 1));

      cy.reload();

      cy.wait(3000);
      cy.get('body').should(
        'contain',
        'API Key has expired. Go to Settings to issue a new key'
      );
    });

    it('should show api is going to expire notification, when first loadng the page if api key expires in less than 30 days', () => {
      cy.updateApiKeyExpiration(addDays(new Date(), 10));

      cy.reload();

      cy.wait(3000);
      cy.get('body').should('contain', 'API Key expires in 9 days');
    });
  });
});
