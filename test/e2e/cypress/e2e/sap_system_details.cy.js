import * as sapSystemDetailsPage from '../pageObject/sap_system_details_po';

import { createUserRequestFactory } from '@lib/test-utils/factories';

import { selectedSystem } from '../fixtures/sap-system-details/selected_system';

context('SAP system details', () => {
  // before(() => sapSystemDetailsPage.preloadTestData());

  describe('SAP system details page is available', () => {
    beforeEach(() => sapSystemDetailsPage.visit());

    it('should have expected url', () => {
      sapSystemDetailsPage.validatePageUrl();
    });

    it('should display the selected system details page', () => {
      sapSystemDetailsPage.pageTitleIsCorrectlyDisplayed('SAP System Details');
      sapSystemDetailsPage.sapSystemHasExpectedName();
      sapSystemDetailsPage.sapSystemHasExpectedType();
    });

    it(`should display "Not found" page when SAP system doesn't exist`, () => {
      sapSystemDetailsPage.visitNonExistentSapSystem();
      sapSystemDetailsPage.validatePageUrl('other');
      sapSystemDetailsPage.notFoundLabelIsDisplayed();
    });
  });

  describe('The system layout shows all the running instances', () => {
    beforeEach(() => sapSystemDetailsPage.visit());

    after(() => sapSystemDetailsPage.restoreInstanceHealth());

    it('should show each hostname with the correct values', () => {
      sapSystemDetailsPage.layoutTableShowsExpectedData();
    });

    it('should show expected status badge in instance when a new state is received', () => {
      sapSystemDetailsPage.shouldDisplayExpectedHealthStatusChanges();
    });

    /* This test is skipped because there is not any option to remove added SAP instances or
    resetting the database afterwards, and it affects the rest of the test suite.*/
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip(`should show a new instance when an event with a new SAP instance is received`, () => {
      cy.loadScenario(`sap-system-detail-NEW`);
      cy.get('table.table-fixed').eq(0).find('tr').should('have.length', 6);
      cy.get('table.table-fixed')
        .eq(0)
        .find('tr')
        .eq(-1)
        .find('td')
        .as('tableCell');
      cy.get('@tableCell').eq(0).should('contain', 'sapnwdaas1');
      cy.get('@tableCell').eq(1).should('contain', '99');
    });
  });

  describe('The hosts table shows the attached hosts to this SAP system', () => {
    beforeEach(() => sapSystemDetailsPage.visit());

    it('should have a correct link to the host', () => {
      sapSystemDetailsPage.eachHostHasTheExpectedLink();
    });

    it('should show every host with its data', () => {
      sapSystemDetailsPage.eachHostHasTheExpectedData();
    });
  });

  describe('Deregistration', () => {
    beforeEach(() => {
      sapSystemDetailsPage.restoreDeregisteredHost();
      sapSystemDetailsPage.visit();
      sapSystemDetailsPage.hostToDeregisterIsDisplayed();
      sapSystemDetailsPage.apiDeregisterHost();
    });

    it('should not include deregistered host in the list', () => {
      sapSystemDetailsPage.hostToDeregisterIsNotDisplayed();
    });

    it('should include restored host again in the list', () => {
      sapSystemDetailsPage.restoreDeregisteredHost();
      sapSystemDetailsPage.hostToDeregisterIsDisplayed();
    });
  });

  describe('Forbidden actions', () => {
    const password = 'password';

    beforeEach(() => {
      cy.deleteAllUsers();
      cy.logout();
      const user = createUserRequestFactory.build({
        password,
        password_confirmation: password,
      });
      cy.wrap(user).as('user');
    });

    describe('Application instance clean up', () => {
      before(() => {
        cy.loadScenario(`sap-systems-overview-NWD-00-absent`);
      });

      it('should forbid application instance cleanup', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });
        cy.visit(`/sap_systems/${selectedSystem.Id}`);

        cy.contains('button', 'Clean up').should('be.disabled');
      });

      it('should allow application instance clenaup', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'cleanup', resource: 'application_instance' },
          ]);
          cy.login(user.username, password);
        });
        cy.visit(`/sap_systems/${selectedSystem.Id}`);

        cy.contains('button', 'Clean up').should('be.enabled');
      });
    });
  });
});
