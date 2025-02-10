import * as databasesOverviewPage from '../pageObject/databases-overview-po';

context('Databases Overview', () => {
  before(() => {
    databasesOverviewPage.preloadTestData();
    databasesOverviewPage.visit();
    databasesOverviewPage.validateUrl('/databases');
  });

  beforeEach(() => {
    databasesOverviewPage.restoreHdqDatabasePrimaryInstance();
  });

  describe('Deregistration', () => {
    it(`should not display DB ${databasesOverviewPage.hdqDatabase.sid} after deregistering the primary instance`, () => {
      databasesOverviewPage.deregisterHdqDatabasePrimaryInstance();
      databasesOverviewPage.hdqDatabaseIsNotDisplayed();
    });

    it(`should display DB ${databasesOverviewPage.hdqDatabase.sid} again after restoring the primary instance`, () => {
      databasesOverviewPage.hdqDatabaseIsDisplayed();
    });

    it(`should include both instances in DB ${databasesOverviewPage.hdqDatabase.sid} after restoring the primary instance`, () => {
      databasesOverviewPage.clickHdqDatabaseRow();
      databasesOverviewPage.bothDatabaseInstancesAreDisplayed();
    });

    it('should show the ACTIVE pill in the right host', () => {
      databasesOverviewPage.clickHdqDatabaseRow();
      databasesOverviewPage.activePillIsDisplayedInTheRightHost();
    });

    it('should not deregister database instances if the SAP system using the database is deregistered', () => {
      databasesOverviewPage.deregisterNwqSystemAscsInstance();
      databasesOverviewPage.deletedSapSystemToasterIsDisplayed();
      databasesOverviewPage.databaseInstancesAreStillTheSame();
    });
  });

  describe('Instance deregistration', () => {
    before(() => {
      databasesOverviewPage.clickHddDatabaseRow();
    });

    beforeEach(() => {
      databasesOverviewPage.markHddDatabaseAsAbsent();
    });

    it('should mark an instance as absent and restore it as present on received respective discovery messages', () => {
      databasesOverviewPage.cleanUpButtonIsDisplayed();
      databasesOverviewPage.markHddDatabaseAsPresent();
      databasesOverviewPage.cleanUpButtonIsNotDisplayed();
    });

    it('should deregister the database after deregistering an absent primary', () => {
      databasesOverviewPage.clickCleanUpButton();
      databasesOverviewPage.clickModalCleanUpButton();
      databasesOverviewPage.hddDatabaseIsNotDisplayed();
    });
  });

  describe('Forbidden actions', () => {
    beforeEach(() => {
      databasesOverviewPage.apiDeleteAllUsers();
      databasesOverviewPage.logout();
    });

    describe('Tag creation', () => {
      before(() => {
        databasesOverviewPage.apiRemoveAllTags();
        databasesOverviewPage.addTagByColumnValue('HDQ', 'env1');
      });

      it('it should prevent a tag update when the user abilities are not compliant', () => {
        databasesOverviewPage.apiCreateUserWithoutAbilities();
        databasesOverviewPage.loginWithoutAbilities();
        databasesOverviewPage.visit();
        databasesOverviewPage.addTagButtonsAreDisabled();
        databasesOverviewPage.removeTagButtonIsDisabled();
      });

      it('it should allow a tag update when the user abilities are compliant', () => {
        databasesOverviewPage.apiCreateUserWithDatabaseTagsAbilities();
        databasesOverviewPage.loginWithTagAbilities();
        databasesOverviewPage.visit();
        databasesOverviewPage.addTagButtonsAreNotDisabled();
        databasesOverviewPage.removeTagButtonIsEnabled();
      });
    });

    describe('Database instance clean up', () => {
      before(() => {
        databasesOverviewPage.markHddDatabaseAsPresent();
        databasesOverviewPage.markHddDatabaseAsAbsent();
      });

      it('should forbid database instance cleanup', () => {
        databasesOverviewPage.apiCreateUserWithoutAbilities();
        databasesOverviewPage.loginWithoutAbilities();
        databasesOverviewPage.visit();
        databasesOverviewPage.cleanUpButtonIsDisabled();
      });

      it('should allow database instance clean up', () => {
        databasesOverviewPage.apiCreateUserWithCleanupAbilities();
        databasesOverviewPage.loginWithTagAbilities();
        databasesOverviewPage.visit();
        databasesOverviewPage.cleanUpButtonIsEnabled();
      });
    });
  });
});
