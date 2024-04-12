/* eslint-disable cypress/no-unnecessary-waiting */
import { subDays, addDays } from 'date-fns';

context('Settings page', () => {
  before(() => {
    cy.visit('/settings');
  });

  after(() => {
    cy.updateApiKeyExpiration(null);
  });

  describe('Api key display', () => {
    it('should display the api key with the copy button', () => {
      cy.updateApiKeyExpiration(null);

      cy.reload();

      cy.get('body').should('contain', 'Key will never expire');
      cy.get('code').should('not.be.empty');
      cy.get('[aria-label="copy to clipboard"]').should('be.visible');
    });
  });

  describe('Api Key generation', () => {
    it('should generate a new api key', () => {
      cy.get('button').contains('Generate Key').click();
      cy.get('.rc-input-number-input').as('quantityInput');
      cy.get('.generate-api-key').as('generateButton');

      cy.get('@quantityInput').type('2');
      cy.get('@generateButton').click();

      cy.get('.generate-api-confirmation').as('confirmationGenerateButton');
      cy.get('@confirmationGenerateButton').click();

      cy.get(':nth-child(1) > .w-full > code').as('generatedApiKey');
      cy.get('@generatedApiKey').should('not.be.empty');

      cy.get('.flex-col > :nth-child(1) > button').as('copyApiKey');
      cy.get('@copyApiKey').should('be.visible');

      cy.get('.flex-col > :nth-child(2) > .text-gray-600').as('expirationDate');

      cy.get('@expirationDate').should('contain', 'Key will expire');
      cy.get('button').contains('Close').click();
    });
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
