import {
  allClusterNames,
  clusterIdByName,
} from '../fixtures/clusters-overview/available_clusters';

context('Clusters Overview', () => {
  const availableClusters = allClusterNames();
  before(() => {
    cy.loadScenario('healthy-27-node-SAP-cluster');
    cy.login();
    cy.navigateToItem('Clusters');
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

      it('Unnamed clusters should use the ID as details page link', () => {
        const clusterID = clusterIdByName('hana_cluster_1');
        cy.get(`a:contains(${clusterID})`).should('be.visible');
      });
    });
  });
});
