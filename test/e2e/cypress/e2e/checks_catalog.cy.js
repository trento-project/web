import { catalogCheckFactory } from '@lib/test-utils/factories';
import { groupBy } from 'lodash';

context('Checks catalog', () => {
  const checksCatalogURL = `**/api/v2/checks/catalog`;

  const clusterChecksGroup = 'Group 1';
  const group1Checks = 2;

  const hostChecksGroup = 'Group 2';
  const group2Checks = 4;

  const genericGroup = 'Group 3';
  const group3Checks = 2;

  const checksInGroup = {
    [clusterChecksGroup]: group1Checks,
    [hostChecksGroup]: group2Checks,
    [genericGroup]: group3Checks,
  };

  const group1 = catalogCheckFactory.buildList(group1Checks, {
    group: clusterChecksGroup,
    metadata: { target_type: 'cluster' },
  });
  const group2 = catalogCheckFactory.buildList(group2Checks, {
    group: hostChecksGroup,
    metadata: { target_type: 'host' },
  });
  const group3 = catalogCheckFactory.buildList(group3Checks, {
    group: genericGroup,
  });
  const catalog = [...group1, ...group2, ...group3];

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
          cy.get('.check-group')
            .eq(index)
            .within(() => {
              cy.get('.check-row').should('have.length', checksInGroup[group]);
            });
        });
        checks.forEach(({ id }) => {
          it(`should include check '${id}'`, () => {
            cy.get('.check-row').should('contain', id);
          });
        });
      }
    );
    it('should include the correct number of icons for each target type', () => {
      cy.get(`[data-testid="target-icon-cluster"]`).should(
        'have.length',
        group1Checks
      );
      cy.get(`[data-testid="target-icon-host"]`).should(
        'have.length',
        group2Checks
      );
    });
  });

  describe('Individual checks data is expanded', () => {
    it('should expand check data when clicked', () => {
      cy.get('.check-panel').should('not.exist');
      cy.get('div.check-row').contains(catalog[0].description).click();
      cy.get(`.check-panel`).should('be.visible');
    });
  });

  describe('Filtering', () => {
    [
      ['aws', 'AWS', 1, 1],
      ['azure', 'Azure', 2, 5],
      ['gcp', 'GCP', 3, 7],
    ].forEach(([provider, label, groupCount, checkCount]) => {
      it(`should query the correct checks data filtered by provider ${label}`, () => {
        cy.intercept(`${checksCatalogURL}?provider=${provider}`, {
          body: { items: catalog.slice(0, checkCount) },
        }).as('request');

        cy.get('.providers-selection-dropdown').click();
        cy.get('.providers-selection-dropdown')
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
