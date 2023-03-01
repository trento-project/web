import {
  allClusterNames,
  clusterIdByName,
  healthyClusterScenario,
  unhealthyClusterScenario,
} from '../fixtures/clusters-overview/available_clusters';

context('Clusters Overview', () => {
  const availableClusters = allClusterNames();
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
    describe('Discovered clusternames are the expected ones', () => {
      availableClusters.forEach((clusterName) => {
        it(`should have a cluster named ${clusterName}`, () => {
          cy.get('.tn-clustername').each(($link) => {
            const displayedClusterName = $link.text().trim();
            expect(availableClusters).to.include(displayedClusterName);
          });
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
