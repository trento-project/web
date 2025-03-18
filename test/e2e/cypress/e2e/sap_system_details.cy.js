import * as sapSystemDetailsPage from '../pageObject/sap_system_details_po';

import { createUserRequestFactory } from '@lib/test-utils/factories';

import { selectedSystem } from '../fixtures/sap-system-details/selected_system';

context('SAP system details', () => {
  before(() => sapSystemDetailsPage.preloadTestData());

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
    const hostToDeregister = {
      name: 'vmnwdev02',
      id: 'fb2c6b8a-9915-5969-a6b7-8b5a42de1971',
      features: 'ENQREP',
    };

    it(`should not include ${hostToDeregister.name} in the list of hosts`, () => {
      cy.deregisterHost(hostToDeregister.id);
      cy.contains(hostToDeregister.name).should('not.exist');
      cy.contains(hostToDeregister.features).should('not.exist');
    });

    it(`should include ${hostToDeregister.name} again in the list of hosts`, () => {
      cy.loadScenario(`host-${hostToDeregister.name}-restore`);
      cy.contains(hostToDeregister.name).should('exist');
      cy.contains(hostToDeregister.features).should('exist');
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
