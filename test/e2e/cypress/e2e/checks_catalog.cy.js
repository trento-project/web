import { catalogCheckFactory } from '@lib/test-utils/factories';
import { groupBy } from '@lib/lists';

context('Checks catalog', () => {
  const checksCatalogURL = `**/api/checks/catalog`;

  const group1 = catalogCheckFactory.buildList(2, { group: 'Group 1' });
  const group2 = catalogCheckFactory.buildList(2, { group: 'Group 2' });
  const group3 = catalogCheckFactory.buildList(2, { group: 'Group 3' });
  const catalog = group1.concat(group2, group3);

  before(() => {
    cy.visit('/catalog');
    cy.url().should('include', '/catalog');
    cy.intercept(checksCatalogURL, {
      body: { items: catalog },
    });
  });

  describe('Checks catalog should be available', () => {
    it('should show 3 check groups in the catalog', () => {
      cy.get('div.check-group').should('have.length', 3);
    });
    it('should show 6 checks in the catalog', () => {
      cy.get('div.check-row').should('have.length', 6);
    });
  });

  describe('Checks grouping and identification is correct', () => {
    Object.entries(groupBy(catalog, 'group')).forEach(([group, checks]) => {
      it(`should include group '${group}'`, () => {
        cy.get('.check-group > div > h3').should('contain', group);
      });
      checks.forEach(({ id }) => {
        it(`should include check '${id}'`, () => {
          cy.get('.check-row').should('contain', id);
        });
      });
    });
  });

  describe('Provider selection', () => {
    [
      ['aws', 'AWS', 2],
      ['azure', 'Azure', 3],
      ['gcp', 'GCP', 4],
    ].forEach(([provider, label, checkCount]) => {
      it(`should query the correct checks data filtered by provider ${label}`, () => {
        cy.intercept(`${checksCatalogURL}?provider=${provider}`, {
          body: { items: catalog.slice(0, checkCount) },
        }).as('request');

        cy.get('.cloud-provider-selection-dropdown').click();
        cy.get('.cloud-provider-selection-dropdown')
          .get('span')
          .contains(label)
          .click();

        cy.wait('@request');
        cy.get('div.check-row').should('have.length', checkCount);
      });
    });
  });

  describe('Individual checks data is expanded', () => {
    it('should expand check data when clicked', () => {
      cy.get('div.check-row')
        .first()
        .parent()
        .invoke('attr', 'id')
        .then(() => {
          cy.get('div.check-row').first().click();
          cy.get(`.check-panel`).should('exist');
          cy.get('div.check-row').first().click();
          cy.get('.check-panel').should('not.exist');
        });
    });
  });

  describe('Catalog error', () => {
    it('should show an error notification if the catalog cannot be obtained', () => {
      cy.intercept(checksCatalogURL, { forceNetworkError: true });
      cy.visit('/catalog');
      cy.contains('Network Error');
      cy.contains('Try again');
    });
  });
});
