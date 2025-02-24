import * as hanaDbDetailsPage from '../pageObject/hana-database-details-po';

import { attachedHosts } from '../fixtures/hana-database-details/selected_database';

context('HANA database details', () => {
  before(() => {
    hanaDbDetailsPage.preloadTestData();
  });
  beforeEach(() => {
    hanaDbDetailsPage.visitDatabase();
  });

  describe('HANA database details page is available', () => {
    it('should display database id in page header', () => {
      hanaDbDetailsPage.validatePageUrl();
    });

    it('should display the expected SID in database details page', () => {
      hanaDbDetailsPage.pageTitleIsCorrectlyDisplayed('HANA Database Details');
      hanaDbDetailsPage.databaseHasExpectedName();
      hanaDbDetailsPage.databaseHasExpectedType();
    });

    it(`should display "Not found" page when HANA database doesn't exist`, () => {
      hanaDbDetailsPage.visitNonExistentDatabase();
      hanaDbDetailsPage.validateNonExistentDatabaseUrl();
      hanaDbDetailsPage.pageNotFoundLabelIsDisplayed();
    });
  });

  describe('The database layout shows all the running instances', () => {
    beforeEach(() => {
      hanaDbDetailsPage.visitDatabase();
    });

    after(() => {
      hanaDbDetailsPage.restoreDatabaseInstanceHealth();
    });

    it(`should show each hostname with the expected values`, () => {
      hanaDbDetailsPage.eachHostNameHasExpectedValues();
    });

    it('should show Green badge in instance when SAPControl-GREEN state is received', () => {
      hanaDbDetailsPage.loadScenario('hana-database-detail-GREEN');
      hanaDbDetailsPage.hostHasStatus('Green');
      hanaDbDetailsPage.hostHasClass('Green');
    });

    it('should show Red badge in instance when SAPControl-RED state is received', () => {
      hanaDbDetailsPage.loadScenario('hana-database-detail-RED');
      hanaDbDetailsPage.hostHasStatus('Red');
      hanaDbDetailsPage.hostHasClass('Red');
    });

    it('should show Yellow badge in instance when SAPControl-YELLOW state is received', () => {
      hanaDbDetailsPage.loadScenario('hana-database-detail-YELLOW');
      hanaDbDetailsPage.hostHasStatus('Yellow');
      hanaDbDetailsPage.hostHasClass('Yellow');
    });

    it('should show Gray badge in instance when SAPControl-GRAY state is received', () => {
      hanaDbDetailsPage.loadScenario('hana-database-detail-GRAY');
      hanaDbDetailsPage.hostHasStatus('Gray');
      hanaDbDetailsPage.hostHasClass('Gray');
    });

    /* This test is skipped because there is not any option to remove added database instances or
    resetting the database afterwards, and it affects the rest of the test suite.*/
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip(`should show a new instance when an event with a new SAP instance is received`, () => {
      cy.loadScenario(`hana-database-detail-NEW`);
      cy.get('table.table-fixed').eq(0).find('tr').should('have.length', 4);
      cy.get('table.table-fixed')
        .eq(0)
        .find('tr')
        .eq(-1)
        .find('td')
        .as('tableCell');
      cy.get('@tableCell').eq(0).should('contain', 'vmhdbdev02');
      cy.get('@tableCell').eq(1).should('contain', '11');
    });
  });

  describe('The hosts table shows the attached hosts to this HANA database', () => {
    attachedHosts.forEach((host, index) => {
      it(`should show ${host.Name} with the data`, () => {
        cy.get('table.table-fixed')
          .eq(1)
          .find('tr')
          .eq(index + 1)
          .find('td')
          .as('tableCell');
        cy.get('@tableCell').eq(0).should('contain', host.Name);
        host.Addresses.forEach((address) => {
          cy.get('@tableCell').eq(1).should('contain', address);
        });
        cy.get('@tableCell').eq(2).should('contain', host.Provider);
        cy.get('@tableCell').eq(3).should('contain', host.Cluster);
        cy.get('@tableCell').eq(4).should('contain', host.Version);
      });

      it(`should have a correct link to the ${host.Name} host`, () => {
        cy.get('table.table-fixed')
          .eq(1)
          .find('tr')
          .eq(index + 1)
          .find('td')
          .as('tableCell');
        cy.get('@tableCell').eq(0).find('a').click();
        cy.location('pathname').should('eq', `/hosts/${host.AgentId}`);
        cy.go('back');
      });
    });
  });

  describe('Deregistration', () => {
    it(`should not include host ${attachedHosts[0].Name} in the list of hosts`, () => {
      cy.deregisterHost(attachedHosts[0].AgentId);
      cy.contains(attachedHosts[0].Name).should('not.exist');
    });

    it(`should include host ${attachedHosts[0].Name} again in the list of hosts after restoring it`, () => {
      cy.loadScenario(`host-${attachedHosts[0].Name}-restore`);
      cy.contains(attachedHosts[0].Name).should('exist');
    });
  });
});
