import { catalogCheckFactory } from '@lib/test-utils/factories';
import { groupBy } from 'lodash';

context('Checks catalog', () => {
  const checksCatalogURL = `**/api/v1/checks/catalog`;

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
    it('should have only the first group expanded', () => {
      cy.get('div.check-row').should('have.length', 2);
    });
  });

  describe('Checks grouping and identification is correct', () => {
    Object.entries(groupBy(catalog, 'group')).forEach(
      ([group, checks], index) => {
        it(`should include group '${group}'`, () => {
          cy.get('.check-group > div > div > h3').should('contain', group);
        });
        it(`should expand the group '${group}' when clicked`, () => {
          index !== 0 && cy.get('.check-group').contains(group).click();
          cy.get('div.check-row').should('have.length', (index + 1) * 2);
        });
        checks.forEach(({ id }) => {
          it(`should include check '${id}'`, () => {
            cy.get('.check-row').should('contain', id);
          });
        });
      }
    );
  });

  describe('Individual checks data is expanded', () => {
    it('should expand check data when clicked', () => {
      cy.get('.check-panel').should('not.exist');
      cy.get('div.check-row').contains(catalog[0].description).click();
      cy.get(`.check-panel`).should('be.visible');
    });
  });

  describe('Provider selection', () => {
    [
      ['aws', 'AWS', 1, 1],
      ['azure', 'Azure', 2, 3],
      ['gcp', 'GCP', 3, 5],
    ].forEach(([provider, label, groupCount, checkCount]) => {
      it(`should query the correct checks data filtered by provider ${label}`, () => {
        cy.intercept(
          `${checksCatalogURL}?provider=${provider}&target_type=cluster`,
          {
            body: { items: catalog.slice(0, checkCount) },
          }
        ).as('request');

        cy.get('.cloud-provider-selection-dropdown').click();
        cy.get('.cloud-provider-selection-dropdown')
          .get('span')
          .contains(label)
          .click();

        cy.wait('@request');
        cy.get('.check-group').should('have.length', groupCount);
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
