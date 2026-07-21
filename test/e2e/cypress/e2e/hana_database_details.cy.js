// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import * as hanaDbDetailsPage from '../pageObject/hana_database_details_po';

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
      hanaDbDetailsPage.pageTitleHealthIsCorrectlyDisplayed();
      hanaDbDetailsPage.databaseHasExpectedName();
      hanaDbDetailsPage.databaseHasExpectedType();
    });

    it('should display system replication enablement status', () => {
      hanaDbDetailsPage.databaseHasExpectedSystemReplication();
    });

    it(`should display "Not found" page when HANA database doesn't exist`, () => {
      hanaDbDetailsPage.visitNonExistentDatabase();
      hanaDbDetailsPage.validateNonExistentDatabaseUrl();
      hanaDbDetailsPage.pageNotFoundLabelIsDisplayed();
    });
  });

  describe('The database layout shows all the running instances', () => {
    beforeEach(() => {
      hanaDbDetailsPage.restoreDatabaseInstanceHealth();
      hanaDbDetailsPage.visitDatabase();
    });

    after(() => {
      hanaDbDetailsPage.restoreDatabaseInstanceHealth();
    });

    it(`should show each hostname with the expected values`, () => {
      hanaDbDetailsPage.eachHostNameHasExpectedValues();
    });

    it('should show Green badge in instance when GREEN status is received', () => {
      hanaDbDetailsPage.loadScenario('hana-database-detail-GREEN');
      hanaDbDetailsPage.hostHasStatus('Green');
      hanaDbDetailsPage.hostHasClass('Green');
    });

    it('should show Red badge in instance when RED status is received', () => {
      hanaDbDetailsPage.loadScenario('hana-database-detail-RED');
      hanaDbDetailsPage.hostHasStatus('Red');
      hanaDbDetailsPage.hostHasClass('Red');
    });

    it('should show Yellow badge in instance when YELLOW status is received', () => {
      hanaDbDetailsPage.loadScenario('hana-database-detail-YELLOW');
      hanaDbDetailsPage.hostHasStatus('Yellow');
      hanaDbDetailsPage.hostHasClass('Yellow');
    });

    it('should show Gray badge in instance when GRAY status is received', () => {
      hanaDbDetailsPage.loadScenario('hana-database-detail-GRAY');
      hanaDbDetailsPage.hostHasStatus('Gray');
      hanaDbDetailsPage.hostHasClass('Gray');
    });

    /* This test is skipped because there is not any option to remove added database instances or
    resetting the database afterwards, and it affects the rest of the test suite.*/
    // eslint-disable-next-line mocha/no-pending-tests
    it.skip(`should show a new instance when an event with a new SAP instance is received`, () => {
      hanaDbDetailsPage.tableHasExpectedAmountOfRows(2);
      hanaDbDetailsPage.loadNewSapInstance();
      hanaDbDetailsPage.tableHasExpectedAmountOfRows(3);
      hanaDbDetailsPage.newInstanceIsDisplayed();
    });
  });

  describe('The database layout shows system replication data properly', () => {
    beforeEach(() => {
      hanaDbDetailsPage.restoreDatabaseInstanceHealth();
      hanaDbDetailsPage.visitDatabase();
    });

    after(() => {
      hanaDbDetailsPage.restoreDatabaseInstanceHealth();
    });

    it('should show each site with the expected system replication values when both instances are running', () => {
      hanaDbDetailsPage.runningSitesHaveExpectedValues();
    });

    it('should show each site with the expected system replication values when secondary is stopped', () => {
      hanaDbDetailsPage.loadScenario('hana-database-detail-secondary-stopped');
      hanaDbDetailsPage.secondaryStoppedSitesHaveExpectedValues();
    });

    it('should show each site with the expected system replication values when both instances are stoopped', () => {
      hanaDbDetailsPage.loadScenario('hana-database-detail-all-stopped');
      hanaDbDetailsPage.stoppedSitesHaveExpectedValues();
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
    beforeEach(() => {
      hanaDbDetailsPage.restoreFirstAttachedHost();
      hanaDbDetailsPage.visitDatabase();
      hanaDbDetailsPage.deregisteredHostIsDisplayed();
      hanaDbDetailsPage.deregisterFirstAttachedHost();
    });

    afterEach(() => hanaDbDetailsPage.restoreFirstAttachedHost());

    it('should not include deregistered host in the list of hosts', () => {
      hanaDbDetailsPage.deregisteredHostIsNotDisplayed();
    });

    it('should include restored host again in the list of hosts after restoring it', () => {
      hanaDbDetailsPage.restoreFirstAttachedHost();
      hanaDbDetailsPage.deregisteredHostIsDisplayed();
    });
  });

  describe('Stale data', () => {
    before(() => hanaDbDetailsPage.startDatabaseAgentsHeartbeat());

    after(() => hanaDbDetailsPage.stopAgentsHeartbeat());

    it('should mark database data as stale when an agent composing the database stops reporting', () => {
      hanaDbDetailsPage.stopDatabaseAgentHeartbeat();
      hanaDbDetailsPage.databaseHealthIsMarkedAsStale();
      hanaDbDetailsPage.databaseStaleBannerIsDisplayed();
      hanaDbDetailsPage.databaseSiteIsMarkedAsStale();
      hanaDbDetailsPage.databaseInstanceRowIsMarkedAsStale();
      hanaDbDetailsPage.hostRowIsMarkedAsStale();
    });

    it('should mark database data as sync when the agent starts reporting data again', () => {
      hanaDbDetailsPage.startDatabaseAgentHeartbeat();
      hanaDbDetailsPage.markDatabaseAsPresent();
      hanaDbDetailsPage.databaseHealthIsMarkedInSync();
      hanaDbDetailsPage.databaseStaleBannerIsNotDisplayed();
      hanaDbDetailsPage.databaseSiteIsMarkedInSync();
      hanaDbDetailsPage.databaseInstanceRowIsMarkedInSync();
      hanaDbDetailsPage.hostRowIsMarkedInSync();
    });
  });
});
