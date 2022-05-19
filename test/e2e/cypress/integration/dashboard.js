import { agents } from '../fixtures/hosts-overview/available_hosts';
describe('Dashboard page', () => {
  before(() => {
    cy.task('startAgentHeartbeat', agents());
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
