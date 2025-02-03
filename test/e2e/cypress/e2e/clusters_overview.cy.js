import * as clustersOverviewPage from '../pageObject/clusters-overview-po.js';
import { createUserRequestFactory } from '@lib/test-utils/factories';

import {
  availableClusters,
  healthyClusterScenario,
  unhealthyClusterScenario,
} from '../fixtures/clusters-overview/available_clusters';

const clusterIdByName = (clusterName) =>
  availableClusters.find(({ name }) => name === clusterName).id;

const clusterTags = {
  hana_cluster_1: 'env1',
  hana_cluster_2: 'env2',
  hana_cluster_3: 'env3',
};

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
        cy.selectChecks(
          clusterIdByName(healthyClusterScenario.clusterName),
          healthyClusterScenario.checks
        );
        // wip: set expected results
        cy.requestChecksExecution(
          clusterIdByName(healthyClusterScenario.clusterName)
        );

        cy.selectChecks(
          clusterIdByName(unhealthyClusterScenario.clusterName),
          healthyClusterScenario.checks
        );
        // wip: set expected results
        cy.requestChecksExecution(
          clusterIdByName(unhealthyClusterScenario.clusterName)
        );
      });

      after(() => {
        cy.selectChecks(
          clusterIdByName(healthyClusterScenario.clusterName),
          []
        );

        cy.selectChecks(
          clusterIdByName(unhealthyClusterScenario.clusterName),
          []
        );
      });

      it(`should have ${healthyClusterScenario.clusterName} displaying healthy state`, () => {
        cy.get('td')
          .contains(healthyClusterScenario.clusterName)
          .parent()
          .parent()
          .prev()
          .get('div > svg')
          .should('have.class', 'fill-jungle-green-500');
      });

      it(`should have ${unhealthyClusterScenario.clusterName} displaying unhealthy state`, () => {
        cy.get('td')
          .contains(unhealthyClusterScenario.clusterName)
          .parent()
          .parent()
          .prev()
          .get('div > svg')
          .should('have.class', 'fill-red-500');
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

    after(() => clustersOverviewPage.apiRemoveAllTags());
  });

  describe('Deregistration', () => {
    before(() => {
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

    after(() => clustersOverviewPage.apiRemoveAllTags());
  });

  describe('Forbidden action', () => {
    beforeEach(() => {
      cy.deleteAllUsers();
      cy.logout();
      const user = createUserRequestFactory.build({
        password,
        password_confirmation: password,
      });
      cy.wrap(user).as('user');
    });

    const password = 'password';

    describe('Tag operations', () => {
      it('should prevent a tag update when the user abilities are not compliant', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });

        cy.visit('/clusters');

        cy.contains('span', 'Add Tag').should('have.class', 'opacity-50');
        cy.get('[data-test-id="tag-env1"]').should('have.class', 'opacity-50');
      });

      it('should allow a tag update when the user abilities are compliant', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'all', resource: 'cluster_tags' },
          ]);
          cy.login(user.username, password);
        });

        cy.visit('/clusters');

        cy.contains('span', 'Add Tag').should('not.have.class', 'opacity-50');
        cy.get('[data-test-id="tag-env1"]').should(
          'not.have.class',
          'opacity-50'
        );
      });
    });
  });
});
