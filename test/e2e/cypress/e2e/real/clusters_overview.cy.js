import { allClusterNames, clusterIdByName } from '../../support/common';

const availableClusters = [
  ['d2522281-2c76-52dc-8500-10bdf2cc6664', 'hana_cluster'],
];

export const healthyClusterScenario = {
  clusterName: 'hana_cluster',
  checks: ['156F64'],
};

context('Clusters Overview', () => {
  const clustersNames = allClusterNames(availableClusters);
  before(() => {
    cy.visit('/clusters');
    cy.url().should('include', '/clusters');
  });

  describe('Registered Clusters should be available in the overview', () => {
    it('should show all of the registered clusters', () => {
      cy.get('.tn-clustername')
        .its('length')
        .should('eq', clustersNames.length);
    });
    it('should have 1 page', () => {
      cy.get('.tn-page-item').its('length').should('eq', 1);
    });
    describe('Discovered clusternames are the expected ones', () => {
      clustersNames.forEach((clusterName) => {
        it(`should have a cluster named ${clusterName}`, () => {
          cy.get('.tn-clustername').each(($link) => {
            const displayedClusterName = $link.text().trim();
            expect(clustersNames).to.include(displayedClusterName);
          });
        });
      });
    });

    describe('Health status for each cluster is correct', () => {
      before(() => {
        cy.selectChecks(
          clusterIdByName(
            availableClusters,
            healthyClusterScenario.clusterName
          ),
          healthyClusterScenario.checks
        );
        cy.requestChecksExecution(
          clusterIdByName(availableClusters, healthyClusterScenario.clusterName)
        );

        // cy.selectChecks(
        //   clusterIdByName(unhealthyClusterScenario.clusterName),
        //   healthyClusterScenario.checks
        // );
        // cy.requestChecksExecution(
        //   clusterIdByName(unhealthyClusterScenario.clusterName)
        // );
      });

      after(() => {
        cy.selectChecks(
          clusterIdByName(
            availableClusters,
            healthyClusterScenario.clusterName
          ),
          []
        );

        // cy.selectChecks(
        //   clusterIdByName(unhealthyClusterScenario.clusterName),
        //   []
        // );
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

      // it(`should have ${unhealthyClusterScenario.clusterName} displaying unhealthy state`, () => {
      //   cy.get('td')
      //     .contains(unhealthyClusterScenario.clusterName)
      //     .parent()
      //     .parent()
      //     .prev()
      //     .get('div > svg')
      //     .should('have.class', 'fill-red-500');
      // });
    });

    describe('Clusters Tagging', () => {
      before(() => {
        cy.removeTagsFromView();
      });
      const clustersByMatchingPattern = (pattern) => (clusterName) =>
        clusterName.includes(pattern);
      const taggingRules = [
        ['hana_cluster', 'env1'],
        // ['hana_cluster_2', 'env2'],
        // ['hana_cluster_3', 'env3'],
      ];

      taggingRules.forEach(([pattern, tag]) => {
        describe(`Add tag '${tag}' to all clusters with '${pattern}' in the cluster name`, () => {
          clustersNames
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
