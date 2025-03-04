import * as hanaDbDetailsPage from '../pageObject/hana-database-details-po';

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
      hanaDbDetailsPage.tableHasExpectedAmountOfRows(2);
      hanaDbDetailsPage.loadNewSapInstance();
      hanaDbDetailsPage.tableHasExpectedAmountOfRows(3);
      hanaDbDetailsPage.newInstanceIsDisplayed();
    });
  });

  describe('The hosts table shows the attached hosts to this HANA database', () => {
    it('should display each attached host expected data', () => {
      hanaDbDetailsPage.eachAttachedHostHasExpectedValues();
    });

    it(`should have a correct link to each host`, () => {
      hanaDbDetailsPage.eachAttachedHostHasExpectedWorkingLink();
    });
  });

  describe('Deregistration', () => {
    it('should not include deregistered host in the list of hosts', () => {
      hanaDbDetailsPage.deregisterFirstAttachedHost();
      hanaDbDetailsPage.deregisteredHostIsNotDisplayed();
    });

    it('should include restored host again in the list of hosts after restoring it', () => {
      hanaDbDetailsPage.restoreFirstAttachedHost();
      hanaDbDetailsPage.deregisteredHostIsDisplayed();
    });
  });
});
