import * as clustersOverviewPage from '../pageObject/clusters-overview-po.js';

context('Clusters Overview', () => {
  before(() => clustersOverviewPage.preloadTestData());

  beforeEach(() => {
    clustersOverviewPage.interceptClustersEndpoint();
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

    // eslint-disable-next-line mocha/no-skipped-tests
    describe.skip('Health status for each cluster is correct', () => {
      before(() => {
        clustersOverviewPage.selectChecksForHealthyCluster();
        // wip: set expected results
        clustersOverviewPage.requestChecksForHealthyCluster();

        clustersOverviewPage.selectChecksForUnhealthyCluster();
        // wip: set expected results
        clustersOverviewPage.requestChecksForUnhealthyCluster();
      });

      after(() => {
        clustersOverviewPage.removeHealthyClusterChecks();
        clustersOverviewPage.removeUnhealthyClusterChecks();
      });

      it(`should have ${clustersOverviewPage.healthyClusterName} displaying healthy state`, () => {
        clustersOverviewPage.healthyClusterNameDisplaysHealthyState();
      });

      it(`should have ${clustersOverviewPage.unhealthyClusterName} displaying unhealthy state`, () => {
        clustersOverviewPage.unhealthyClusterNameDisplaysUnhealthyState();
      });
    });
  });

  describe('Clusters Tagging', () => {
    beforeEach(() => {
      clustersOverviewPage.restoreClusterName();
      clustersOverviewPage.apiRemoveAllTags();
    });

    it('should tag each cluster with the corresponding tag', () => {
      clustersOverviewPage.setClusterTags();
      clustersOverviewPage.eachClusterTagsIsCorrectlyDisplayed();
    });
  });

  describe('Deregistration', () => {
    before(() => {
      clustersOverviewPage.apiRemoveAllTags();
      clustersOverviewPage.apiSetTagsHanaCluster1();
      clustersOverviewPage.deregisterAllClusterHosts();
    });

    it(`should not display '${clustersOverviewPage.hanaCluster1.name}' after deregistering all its nodes`, () => {
      clustersOverviewPage.clusterIsNotDisplayedWhenNodesAreDeregistered();
    });

    it(`should show cluster '${clustersOverviewPage.hanaCluster1.name}' after registering it again with the previous tags`, () => {
      clustersOverviewPage.restoreClusterHosts();
      clustersOverviewPage.clusterNameIsDisplayed();
      clustersOverviewPage.hanaCluster1TagsAreDisplayed();
    });
  });

  describe('Forbidden action', () => {
    describe('Tag operations', () => {
      beforeEach(() => {
        clustersOverviewPage.apiRemoveAllTags();
        clustersOverviewPage.apiSetTagsHanaCluster1();
        clustersOverviewPage.apiDeleteAllUsers();
        clustersOverviewPage.logout();
      });

      it('should prevent a tag update when the user abilities are not compliant', () => {
        clustersOverviewPage.createUserWithoutAbilities();
        clustersOverviewPage.loginWithoutTagAbilities();
        clustersOverviewPage.visit();
        clustersOverviewPage.addTagButtonsAreDisabled();
        clustersOverviewPage.removeTagButtonIsDisabled();
      });

      it('should allow a tag update when the user abilities are compliant', () => {
        clustersOverviewPage.createUserWithClusterTagsAbilities();
        clustersOverviewPage.loginWithTagAbilities();
        clustersOverviewPage.visit();
        clustersOverviewPage.addTagButtonsAreNotDisabled();
        clustersOverviewPage.removeTagButtonIsEnabled();
      });
    });
  });
});
