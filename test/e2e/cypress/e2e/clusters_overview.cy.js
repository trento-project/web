// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import * as clustersOverviewPage from '../pageObject/clusters_overview_po';

context('Clusters Overview', () => {
  before(() => clustersOverviewPage.preloadTestData());

  beforeEach(() => {
    cy.clearAllSessionStorage();
    clustersOverviewPage.interceptInitialDataFetch();
    clustersOverviewPage.visit();
    clustersOverviewPage.validateUrl();
  });

  describe('Registered Clusters should be available in the overview', () => {
    it('should show all of the registered clusters', () => {
      clustersOverviewPage.allRegisteredClustersAreDisplayed();
    });

    it('should have 1 pages', () => {
      clustersOverviewPage.paginationButtonsAreDisabled();
    });

    it('should show the expected clusters data', () => {
      clustersOverviewPage.clustersDataIsDisplayedAsExpected();
    });

    describe('Unnamed cluster', () => {
      before(() => clustersOverviewPage.loadScenario('cluster-unnamed'));

      it('Unnamed clusters should use the ID as details page link', () => {
        clustersOverviewPage.clusterNameLinkIsDisplayedAsId('hana_cluster_1');
      });

      after(() => clustersOverviewPage.restoreClusterName());
    });

    // wip: to be wired up with a deterministic checks execution
    describe.skip('Health status for each cluster is correct', () => {
      before(() => {
        clustersOverviewPage.apiSelectChecksForHealthyCluster();
        // wip: set expected results
        clustersOverviewPage.apiRequestChecksForHealthyCluster();

        clustersOverviewPage.apiSelectChecksForUnhealthyCluster();
        // wip: set expected results
        clustersOverviewPage.apiRequestChecksForUnhealthyCluster();
      });

      after(() => {
        clustersOverviewPage.apiRemoveHealthyClusterChecks();
        clustersOverviewPage.apiRemoveUnhealthyClusterChecks();
      });

      it(`should have ${clustersOverviewPage.healthyClusterName} displaying healthy state`, () => {
        clustersOverviewPage.healthyClusterNameDisplaysHealthyState();
      });

      it(`should have ${clustersOverviewPage.unhealthyClusterName} displaying unhealthy state`, () => {
        clustersOverviewPage.unhealthyClusterNameDisplaysUnhealthyState();
      });
    });
  });

  describe('Persistent filters', () => {
    const clusterName = clustersOverviewPage.hanaCluster1.name;
    const anotherClusterName = 'netweaver_cluster';

    it('should update the URL with filter params when a filter is selected', () => {
      clustersOverviewPage.selectNameFilter(clusterName);
      cy.url().should('contain', `name=${clusterName}`);
      clustersOverviewPage.clustersListedAre(1);
    });

    it('should preserve filters when coming back to clusters view', () => {
      clustersOverviewPage.selectNameFilter(clusterName);
      clustersOverviewPage.clustersListedAre(1);

      clustersOverviewPage.goNavigationMenuItem('Dashboard');
      clustersOverviewPage.pageTitleIsCorrectlyDisplayed('At a glance');
      clustersOverviewPage.goNavigationMenuItem('Clusters');

      cy.url().should('contain', `name=${clusterName}`);
      clustersOverviewPage.clustersListedAre(1);
    });

    it('should preserve filters when the clusters sidebar entry is clicked from the clusters view', () => {
      clustersOverviewPage.selectNameFilter(clusterName);
      clustersOverviewPage.clustersListedAre(1);

      clustersOverviewPage.goNavigationMenuItem('Clusters');

      cy.url().should('contain', `name=${clusterName}`);
      clustersOverviewPage.clustersListedAre(1);
    });

    it('should preserve filters when reloading clusters view', () => {
      clustersOverviewPage.selectNameFilter(clusterName);
      clustersOverviewPage.clustersListedAre(1);

      clustersOverviewPage.visit();

      cy.url().should('contain', `name=${clusterName}`);
      clustersOverviewPage.clustersListedAre(1);
    });

    it('should preserve the selected items per page when reloading clusters view', () => {
      clustersOverviewPage.selectItemsPerPage(20);
      cy.url().should('contain', 'itemsPerPage=20');

      clustersOverviewPage.visit();

      cy.url().should('contain', 'itemsPerPage=20');
      clustersOverviewPage.selectedItemsPerPageIs(20);
    });

    it('should render filtered results when visiting a URL with filter params overriding previous filters', () => {
      clustersOverviewPage.selectNameFilter(clusterName);
      clustersOverviewPage.clustersListedAre(1);

      clustersOverviewPage.visit(`name=${anotherClusterName}`);

      cy.url().should('contain', `name=${anotherClusterName}`);
      clustersOverviewPage.clustersListedAre(3);
    });
  });

  describe('Clusters Tagging', () => {
    beforeEach(() => {
      clustersOverviewPage.restoreClusterName();
      clustersOverviewPage.apiRemoveAllClusterTags();
    });

    it('should tag each cluster with the corresponding tag', () => {
      clustersOverviewPage.setClusterTags();
      clustersOverviewPage.eachClusterTagsIsCorrectlyDisplayed();
    });
  });

  describe('Deregistration', () => {
    before(() => {
      clustersOverviewPage.apiRemoveAllClusterTags();
      clustersOverviewPage.apiSetTagsHanaCluster1();
      clustersOverviewPage.apiDeregisterAllClusterHosts();
    });

    it(`should not display '${clustersOverviewPage.hanaCluster1.name}' after deregistering all its nodes`, () => {
      clustersOverviewPage.clusterIsNotDisplayedWhenNodesAreDeregistered();
    });

    it(`should show cluster '${clustersOverviewPage.hanaCluster1.name}' after registering it again with the previous tags`, () => {
      clustersOverviewPage.apiRestoreClusterHosts();
      clustersOverviewPage.clusterNameIsDisplayed();
      clustersOverviewPage.hanaCluster1TagsAreDisplayed();
    });
  });

  describe('Stale data', () => {
    before(() => {
      clustersOverviewPage.startAllClustersAgentsHeartbeat();
      clustersOverviewPage.visit();
    });

    after(() => clustersOverviewPage.stopAgentsHeartbeat());

    it('should mark cluster data as stale when an agent composing the cluster stops reporting', () => {
      clustersOverviewPage.stopHanaCluster1AgentHeartbeat();
      clustersOverviewPage.hanaCluster1DataIsMarkedAsStale();
    });

    it('should mark cluster data as sync when the agent starts reporting data again', () => {
      clustersOverviewPage.startHanaCluster1AgentHeartbeat();
      clustersOverviewPage.apiRestoreClusterHosts();
      clustersOverviewPage.hanaCluster1DataIsMarkedInSync();
    });
  });

  describe('Forbidden action', () => {
    describe('Tag operations', () => {
      beforeEach(() => {
        clustersOverviewPage.apiRemoveAllClusterTags();
        clustersOverviewPage.apiSetTagsHanaCluster1();
        clustersOverviewPage.apiDeleteAllUsers();
        clustersOverviewPage.logout();
      });

      it('should prevent a tag update when the user abilities are not compliant', () => {
        clustersOverviewPage.apiCreateUserWithoutAbilities();
        clustersOverviewPage.apiAcceptAnalyticsEula();
        clustersOverviewPage.loginWithoutAbilities();
        clustersOverviewPage.visit();
        clustersOverviewPage.addTagButtonsAreDisabled();
        clustersOverviewPage.removeTagButtonIsDisabled();
      });

      it('should allow a tag update when the user abilities are compliant', () => {
        clustersOverviewPage.apiCreateUserWithClusterTagsAbilities();
        clustersOverviewPage.apiAcceptAnalyticsEula();
        clustersOverviewPage.loginWithAbilities();
        clustersOverviewPage.visit();
        clustersOverviewPage.addTagButtonsAreNotDisabled();
        clustersOverviewPage.removeTagButtonIsEnabled();
      });
    });
  });
});
