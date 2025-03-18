import * as sapSystemDetailsPage from '../pageObject/sap_system_details_po';

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
    it.skip('should show a new instance when an event with a new SAP instance is received', () => {
      sapSystemDetailsPage.loadNewSapSystem();
      sapSystemDetailsPage.newSapSystemIsDisplayed();
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
    beforeEach(() => {
      sapSystemDetailsPage.apiDeleteAllUsers();
      sapSystemDetailsPage.logout();
    });

    describe('Application instance clean up', () => {
      before(() => sapSystemDetailsPage.loadAbsentHostScenario());

      it('should forbid application instance cleanup', () => {
        sapSystemDetailsPage.apiCreateUserWithoutAbilities();
        sapSystemDetailsPage.loginWithoutAbilities();
        sapSystemDetailsPage.visit();
        sapSystemDetailsPage.cleanUpButtonIsDisabled();
      });

      it('should allow application instance clenaup', () => {
        sapSystemDetailsPage.apiCreateUserWithApplicationCleanupAbility();
        sapSystemDetailsPage.loginWithAbilities();
        sapSystemDetailsPage.visit();
        sapSystemDetailsPage.cleanUpButtonIsEnabled();
      });
    });
  });
});
