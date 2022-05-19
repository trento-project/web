import { agents } from '../fixtures/hosts-overview/available_hosts';
import { allClusterIds } from '../fixtures/clusters-overview/available_clusters';

describe('Dashboard page', () => {
  before(() => {
    cy.loadScenario('healthy-27-node-SAP-cluster');
    cy.task('startAgentHeartbeat', agents());
    allClusterIds().forEach((clusterId) => {
      cy.selectChecks(clusterId, []);
    });
    cy.login();
    cy.navigateToItem('Dashboard');
    cy.url().should('include', '/');
  });

  describe('The current state should be available in a summary', () => {
    it('should display 2 Passing clusters and 1 critical', () => {
      cy.get('.bg-green-200 > .rounded > .flex > .font-semibold').should(
        'contain',
        '2'
      );
      cy.get('.bg-yellow-200 > .rounded > .flex > .font-semibold').should(
        'contain',
        '0'
      );
      cy.get('.bg-red-200 > .rounded > .flex > .font-semibold').should(
        'contain',
        '1'
      );
    });
  });
});
