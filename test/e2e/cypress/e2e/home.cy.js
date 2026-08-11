// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import * as homePage from '../pageObject/home_po';

context('Homepage', () => {
  before(() => homePage.preloadTestData());

  beforeEach(() => {
    homePage.visit();
    homePage.validateUrl();
  });

  describe('Stale data', () => {
    beforeEach(() => {
      homePage.startNwpSystemAgentsHeartbeat();
    });

    after(() => homePage.stopAgentsHeartbeat());

    it('should mark the application instances and hosts health as stale when a non clustered application instance agent stops reporting', () => {
      homePage.stopNwpApplicationInstanceAgentHeartbeat();
      homePage.nwpSystemRowIsMarkedStale();
      homePage.nwpApplicationInstancesHealthIsMarkedAsStale();
      homePage.nwpHostsHealthIsMarkedAsStale();
    });

    it('should mark the application cluster health as stale when a clustered application instance agent stops reporting', () => {
      homePage.stopNwpClusteredApplicationInstanceAgentHeartbeat();
      homePage.nwpSystemRowIsMarkedStale();
      homePage.nwpApplicationClusterHealthIsMarkedAsStale();
      homePage.nwpHostsHealthIsMarkedAsStale();
    });

    it('should mark the database and database cluster health as stale when a clustered database instance agent stops reporting', () => {
      homePage.stopNwpClusteredDatabaseInstanceAgentHeartbeat();
      homePage.nwpSystemRowIsMarkedStale();
      homePage.nwpDatabaseHealthIsMarkedAsStale();
      homePage.nwpDatabaseClusterHealthIsMarkedAsStale();
      homePage.nwpHostsHealthIsMarkedAsStale();
    });

    it('should mark system as in sync when all agents start reporting again', () => {
      homePage.startNwpSystemAgentsHeartbeat();
      homePage.restoreNwpSystemData();
      homePage.nwpSystemRowIsMarkedInSync();
    });
  });

  describe('Deregistration', () => {
    before(() => {
      homePage.visit();
      homePage.validateUrl();
    });

    it('should not display SAP System NWP after it is deregistered', () => {
      homePage.nwpSystemShouldBeDisplayed();
      homePage.nwpSystemRowIsMarkedStale();
      homePage.apiDeregisterSapSystemNwpHost();
      homePage.nwpSystemShouldNotBeDisplayed();
    });
  });
});
