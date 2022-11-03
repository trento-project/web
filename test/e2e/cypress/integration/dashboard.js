import { agents } from '../fixtures/hosts-overview/available_hosts';
import { allClusterIds } from '../fixtures/clusters-overview/available_clusters';

describe('Dashboard page', () => {
  before(() => {
    cy.task('startAgentHeartbeat', agents());
    allClusterIds().forEach((clusterId) => {
      cy.selectChecks(clusterId, []);
    });
    cy.navigateToItem('Dashboard');
    cy.url().should('include', '/');
  });

  after(() => {
    cy.task('stopAgentsHeartbeat');
  });

  describe('The current state should be available in a summary', () => {
    it('should display 2 Passing clusters and 1 critical', () => {
      cy.get('.tn-health-passing > .rounded > .flex > .font-semibold', {
        defaultCommandTimeout: 40000,
      }).should('contain', '2');

      cy.get('.tn-health-warning > .rounded > .flex > .font-semibold').should(
        'contain',
        '0'
      );
      cy.get('.tn-health-critical > .rounded > .flex > .font-semibold').should(
        'contain',
        '1'
      );
    });

    it('should have a working link to the passing checks in the overview component', () => {
      cy.get(':nth-child(1) > :nth-child(5) > a').click();
      cy.url().should('include', `/hosts?sid=NWD`);
      cy.go('back');
    });
  });
});
