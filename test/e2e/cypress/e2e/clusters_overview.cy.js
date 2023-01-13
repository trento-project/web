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

    describe('Health status for each cluster is correct', () => {
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

    describe('Filtering', () => {
      describe('by tags', () => {
        const tagsScenarios = [
          ['env1', 1],
          ['env2', 1],
          ['env3', 1],
        ];
        tagsScenarios.forEach(([tag, expectedTaggedClusters]) => {
          it(`should have ${expectedTaggedClusters} clusters tagged with tag '${tag}'`, () => {
            cy.get('[data-testid="filter-Tags"]').click();
            cy.get('.max-h-56', { timeout: 150000 }).contains(tag).click();
            cy.clickOutside();

            cy.get('.tn-clustername')
              .its('length')
              .should('eq', expectedTaggedClusters);

            cy.get('[data-testid="filter-Tags-clear"]').click();
            cy.clickOutside();
          });
        });
      });

      describe('by health', () => {
        const healthScenarios = [
          ['passing', 3],
          ['unknown', 6],
        ];
        healthScenarios.forEach(([health, expectedClustersWithThisHealth]) => {
          it(`should show ${expectedClustersWithThisHealth} clusters when filtering by health '${health}'`, () => {
            cy.get('[data-testid="filter-Health"]').click();
            cy.get('.max-h-56', { timeout: 150000 }).contains(health).click();
            cy.clickOutside();

            cy.get('.tn-clustername')
              .its('length')
              .should('eq', expectedClustersWithThisHealth);

            cy.get('[data-testid="filter-Health-clear"]').click();
            cy.clickOutside();
          });
        });
      });

      describe('by SAP system', () => {
        const SAPSystemsScenarios = [
          ['HDD', 1],
          ['HDP', 1],
          ['HDQ', 1],
        ];
        SAPSystemsScenarios.forEach(([sapsystem, expectedRelatedClusters]) => {
          it(`should have ${expectedRelatedClusters} clusters related to SAP system '${sapsystem}'`, () => {
            cy.get('[data-testid="filter-SID"]').click();
            cy.get('.max-h-56', { timeout: 150000 })
              .contains(sapsystem)
              .click();
            cy.clickOutside();

            cy.get('.tn-clustername')
              .its('length')
              .should('eq', expectedRelatedClusters);

            cy.get('[data-testid="filter-SID-clear"]').click();
            cy.clickOutside();
          });
        });
      });

      describe('by Cluster name', () => {
        const clusterNameScenarios = [
          ['drbd_cluster', 3],
          ['hana_cluster_1', 1],
          ['hana_cluster_2', 1],
          ['hana_cluster_3', 1],
          ['netweaver_cluster', 3],
        ];
        clusterNameScenarios.forEach(
          ([clusterName, expectedRelatedClusters]) => {
            it(`should have ${expectedRelatedClusters} clusters related to name '${clusterName}'`, () => {
              cy.get('[data-testid="filter-Name"]').click();
              cy.get('.max-h-56', { timeout: 150000 })
                .contains(clusterName)
                .click();
              cy.clickOutside();

              cy.get('.tn-clustername')
                .its('length')
                .should('eq', expectedRelatedClusters);

              cy.get('[data-testid="filter-Name-clear"]', {
                timeout: 150000,
              }).click();
              cy.clickOutside();
            });
          }
        );
      });
    });
  });
});
