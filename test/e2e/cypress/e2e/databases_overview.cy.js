// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import * as databasesOverviewPage from '../pageObject/databases_overview_po';

context('Databases Overview', () => {
  before(() => {
    databasesOverviewPage.preloadTestData();
    databasesOverviewPage.visit();
    databasesOverviewPage.validateUrl('/databases');
  });

  beforeEach(() => {
    cy.clearAllSessionStorage();
    databasesOverviewPage.restoreHdqDatabasePrimaryInstance();
  });

  describe('Persistent filters', () => {
    const sid = databasesOverviewPage.hdqDatabase.sid;
    const anotherSid = 'HDP';

    beforeEach(() => databasesOverviewPage.visit());

    it('should update the URL with filter params when a filter is selected', () => {
      databasesOverviewPage.selectSidFilter(sid);

      cy.url().should('contain', `sid=${sid}`);
      databasesOverviewPage.databasesListedAre(1);
    });

    it('should preserve filters when coming back to databases view', () => {
      databasesOverviewPage.selectSidFilter(sid);
      databasesOverviewPage.databasesListedAre(1);

      databasesOverviewPage.goNavigationMenuItem('Dashboard');
      databasesOverviewPage.pageTitleIsCorrectlyDisplayed('At a glance');
      databasesOverviewPage.goNavigationMenuItem('HANA Databases');

      cy.url().should('contain', `sid=${sid}`);
      databasesOverviewPage.databasesListedAre(1);
    });

    it('should preserve filters when the databases sidebar entry is clicked from the databases view', () => {
      databasesOverviewPage.selectSidFilter(sid);
      databasesOverviewPage.databasesListedAre(1);

      databasesOverviewPage.goNavigationMenuItem('HANA Databases');

      cy.url().should('contain', `sid=${sid}`);
      databasesOverviewPage.databasesListedAre(1);
    });

    it('should preserve filters when reloading databases view', () => {
      databasesOverviewPage.selectSidFilter(sid);
      databasesOverviewPage.databasesListedAre(1);

      databasesOverviewPage.visit();

      cy.url().should('contain', `sid=${sid}`);
      databasesOverviewPage.databasesListedAre(1);
    });

    it('should preserve the selected items per page when reloading databases view', () => {
      databasesOverviewPage.selectItemsPerPage(20);
      cy.url().should('contain', 'itemsPerPage=20');

      databasesOverviewPage.visit();

      cy.url().should('contain', 'itemsPerPage=20');
      databasesOverviewPage.selectedItemsPerPageIs(20);
    });

    it('should render filtered results when visiting a URL with filter params overriding previous filters', () => {
      databasesOverviewPage.selectSidFilter(sid);
      databasesOverviewPage.databasesListedAre(1);

      databasesOverviewPage.visit(`sid=${anotherSid}`);

      cy.url().should('contain', `sid=${anotherSid}`);
      databasesOverviewPage.databaseIsDisplayed(anotherSid);
      databasesOverviewPage.hdqDatabaseIsNotDisplayed();
    });
  });

  describe('Deregistration', () => {
    beforeEach(() => {
      databasesOverviewPage.visit();
      databasesOverviewPage.expandHdqDatabaseRow();
    });

    it(`should not display DB ${databasesOverviewPage.hdqDatabase.sid} after deregistering the primary instance`, () => {
      databasesOverviewPage.deregisterHdqDatabasePrimaryInstance();
      databasesOverviewPage.hdqDatabaseIsNotDisplayed();
    });

    it(`should display DB ${databasesOverviewPage.hdqDatabase.sid} again after restoring the primary instance`, () => {
      databasesOverviewPage.hdqDatabaseIsDisplayed();
    });

    it(`should include both instances in DB ${databasesOverviewPage.hdqDatabase.sid} after restoring the primary instance`, () => {
      databasesOverviewPage.bothDatabaseInstancesAreDisplayed();
    });

    it('should show the ACTIVE pill in the right host', () => {
      databasesOverviewPage.activePillIsDisplayedInTheRightHost();
    });

    it('should not deregister database instances if the SAP system using the database is deregistered', () => {
      databasesOverviewPage.deregisterNwqSystemAscsInstance();
      databasesOverviewPage.deletedSapSystemToasterIsDisplayed();
      databasesOverviewPage.databaseInstancesAreStillTheSame();
    });
  });

  describe('Instance deregistration', () => {
    before(() => databasesOverviewPage.expandHddDatabaseRow());

    after(() => databasesOverviewPage.markHddDatabaseAsPresent());

    beforeEach(() => databasesOverviewPage.markHddDatabaseAsAbsent());

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

  describe('Stale data', () => {
    before(() => {
      databasesOverviewPage.startAllDatabasesAgentsHeartbeat();
      databasesOverviewPage.visit();
      databasesOverviewPage.expandHddDatabaseRow();
    });

    after(() => databasesOverviewPage.stopAgentsHeartbeat());

    it('should mark database data as stale when an agent composing the database stops reporting', () => {
      databasesOverviewPage.stopHddDatabaseAgentHeartbeat();
      databasesOverviewPage.hddDatabaseDataIsMarkedAsStale();
      databasesOverviewPage.hddDatabaseInstanceRowIsMarkedAsStale();
    });

    it('should mark database data as sync when the agent starts reporting data again', () => {
      databasesOverviewPage.startHddDatabaseAgentHeartbeat();
      databasesOverviewPage.markHddDatabaseAsPresent();
      databasesOverviewPage.hddDatabaseDataIsMarkedInSync();
      databasesOverviewPage.hddDatabaseInstanceRowIsMarkedInSync();
    });
  });

  describe('Forbidden actions', () => {
    beforeEach(() => {
      databasesOverviewPage.apiDeleteAllUsers();
      databasesOverviewPage.logout();
    });

    describe('Tag creation', () => {
      before(() => {
        databasesOverviewPage.apiRemoveAllDatabaseTags();
        databasesOverviewPage.addTagByColumnValue('HDQ', 'env1');
      });

      it('it should prevent a tag update when the user abilities are not compliant', () => {
        databasesOverviewPage.apiCreateUserWithoutAbilities();
        databasesOverviewPage.apiAcceptAnalyticsEula();
        databasesOverviewPage.loginWithoutAbilities();
        databasesOverviewPage.visit();
        databasesOverviewPage.addTagButtonsAreDisabled();
        databasesOverviewPage.removeTagButtonIsDisabled();
      });

      it('it should allow a tag update when the user abilities are compliant', () => {
        databasesOverviewPage.apiCreateUserWithDatabaseTagsAbilities();
        databasesOverviewPage.apiAcceptAnalyticsEula();
        databasesOverviewPage.loginWithAbilities();
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
        databasesOverviewPage.apiAcceptAnalyticsEula();
        databasesOverviewPage.loginWithoutAbilities();
        databasesOverviewPage.visit();
        databasesOverviewPage.cleanUpButtonIsDisabled();
      });

      it('should allow database instance clean up', () => {
        databasesOverviewPage.apiCreateUserWithCleanupAbilities();
        databasesOverviewPage.apiAcceptAnalyticsEula();
        databasesOverviewPage.loginWithAbilities();
        databasesOverviewPage.visit();
        databasesOverviewPage.cleanUpButtonIsEnabled();
      });
    });
  });
});
