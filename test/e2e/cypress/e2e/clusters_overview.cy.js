import {
  availableClusters,
  healthyClusterScenario,
  unhealthyClusterScenario,
} from '../fixtures/clusters-overview/available_clusters';

const clusterIdByName = (clusterName) =>
  availableClusters.find(({ name }) => name === clusterName).id;

context('Clusters Overview', () => {
  beforeEach(() => {
    cy.visit('/clusters');
    cy.url().should('include', '/clusters');
  });

  describe('Registered Clusters should be available in the overview', () => {
    it('should show all of the registered clusters', () => {
      cy.get('.tn-clustername')
        .its('length')
        .should('eq', availableClusters.length);
    });
    it('should have 1 pages', () => {
      cy.get('.tn-page-item').its('length').should('eq', 1);
    });
    it('should show the expected clusters data', () => {
      cy.get('.container').eq(0).as('clustersTable');
      availableClusters.forEach((cluster, index) => {
        cy.get('@clustersTable')
          .find('tr')
          .eq(index + 1)
          .find('td')
          .as('clusterRow');

        cy.get('@clustersTable')
          .contains('th', 'Name')
          .invoke('index')
          .then((i) => {
            cy.get('@clusterRow').eq(i).should('contain', cluster.name);
          });

        cy.get('@clustersTable')
          .contains('th', 'SID')
          .invoke('index')
          .then((i) => {
            cy.get('@clusterRow').eq(i).should('contain', cluster.sid);
          });

        cy.get('@clustersTable')
          .contains('th', 'Type')
          .invoke('index')
          .then((i) => {
            cy.get('@clusterRow').eq(i).should('contain', cluster.type);
          });
      });
    });
    describe('Unnamed cluster', () => {
      before(() => {
        cy.loadScenario('cluster-unnamed');
      });

      // Restore cluster name
      after(() => {
        cy.loadScenario('cluster-4-SOK');
      });

      it('Unnamed clusters should use the ID as details page link', () => {
        const clusterID = clusterIdByName('hana_cluster_1');
        cy.get(`a:contains(${clusterID})`).should('be.visible');
      });
    });

    describe.skip('Health status for each cluster is correct', () => {
      before(() => {
        cy.selectChecks(
          clusterIdByName(healthyClusterScenario.clusterName),
          healthyClusterScenario.checks
        );
        cy.setMockRunnerExpectedResult(healthyClusterScenario.result);
        cy.requestChecksExecution(
          clusterIdByName(healthyClusterScenario.clusterName)
        );

        cy.selectChecks(
          clusterIdByName(unhealthyClusterScenario.clusterName),
          healthyClusterScenario.checks
        );
        cy.setMockRunnerExpectedResult(unhealthyClusterScenario.result);
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

    describe('Clusters Tagging', () => {
      before(() => {
        cy.removeTagsFromView();
      });
      const clustersByMatchingPattern = (pattern) => (clusterName) =>
        clusterName.includes(pattern);
      const taggingRules = [
        ['hana_cluster_1', 'env1'],
        ['hana_cluster_2', 'env2'],
        ['hana_cluster_3', 'env3'],
      ];

      taggingRules.forEach(([pattern, tag]) => {
        describe(`Add tag '${tag}' to all clusters with '${pattern}' in the cluster name`, () => {
          availableClusters
            .map(({ name }) => name)
            .filter(clustersByMatchingPattern(pattern))
            .forEach((clusterName) => {
              it(`should tag cluster '${clusterName}'`, () => {
                cy.addTagByColumnValue(clusterName, tag);
              });
            });
        });
      });
    });
  });
});
