// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import * as homePage from '../pageObject/home_po';

context('Homepage', () => {
  before(() => homePage.preloadTestData());

  beforeEach(() => {
    cy.clearAllSessionStorage();
    homePage.visit();
    homePage.validateUrl();
  });

  describe('Persistent filters', () => {
    it('should update the URL with filter params when a filter is selected', () => {
      homePage.sapSystemsListedAre(3);

      homePage.selectHealthFilter('critical');

      cy.url().should('contain', 'health=critical');
      homePage.sapSystemsListedAre(2);
    });

    it('should preserve filters when coming back to the home view', () => {
      homePage.selectHealthFilter('critical');
      homePage.sapSystemsListedAre(2);

      homePage.goNavigationMenuItem('Hosts');
      homePage.pageTitleIsCorrectlyDisplayed('Hosts');
      homePage.goNavigationMenuItem('Dashboard');

      cy.url().should('contain', 'health=critical');
      homePage.sapSystemsListedAre(2);
    });

    it('should preserve filters when the home sidebar entry is clicked from the home view', () => {
      homePage.selectHealthFilter('critical');
      homePage.sapSystemsListedAre(2);

      homePage.goNavigationMenuItem('Dashboard');

      cy.url().should('contain', 'health=critical');
      homePage.sapSystemsListedAre(2);
    });

    it('should preserve filters when reloading the home view', () => {
      homePage.selectHealthFilter('critical');
      homePage.sapSystemsListedAre(2);

      homePage.visit();

      cy.url().should('contain', 'health=critical');
      homePage.sapSystemsListedAre(2);
    });

    it('should render filtered results when visiting a URL with filter params overriding previous filters', () => {
      homePage.selectHealthFilter('critical');
      homePage.sapSystemsListedAre(2);

      homePage.visit('health=warning');

      cy.url().should('contain', 'health=warning');
      homePage.sapSystemsListedAre(1);
    });
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
