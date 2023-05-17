import { availableClusters } from '../../fixtures/clusters-overview/available_clusters';
import { clusterIdByName } from '../../support/common';

context('Clusters Overview', () => {
  beforeEach(() => {
    cy.visit('/clusters');
    cy.url().should('include', '/clusters');
  });

  describe('Registered Clusters should be available in the overview', () => {
    describe('Unnamed cluster', () => {
      before(() => {
        cy.loadScenario('cluster-unnamed');
      });

      // Restore cluster name
      after(() => {
        cy.loadScenario('cluster-4-SOK');
      });

      it('Unnamed clusters should use the ID as details page link', () => {
        const clusterID = clusterIdByName(availableClusters, 'hana_cluster_1');
        cy.get(`a:contains(${clusterID})`).should('be.visible');
      });
    });
  });
});
