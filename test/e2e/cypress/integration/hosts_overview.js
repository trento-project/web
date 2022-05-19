import {
  allHostNames,
  agents,
} from '../fixtures/hosts-overview/available_hosts';

context('Hosts Overview', () => {
  const availableHosts = allHostNames();
  before(() => {
    cy.task('startAgentHeartbeat', agents());
    cy.login();

    cy.navigateToItem('Hosts');
    cy.url().should('include', '/hosts');
  });

  describe('Registered Hosts are shown in the list', () => {
    it('should show 10 of the 27 registered hosts', () => {
      cy.get('.tn-hostname').its('length').should('eq', 10);
    });
    it('should show the 10 visible hosts as healthy', () => {
      cy.get('.tn-healthicon').its('length').should('eq', 10);
    });
    it('should have 3 pages', () => {
      cy.get('.tn-page-item').its('length').should('eq', 3);
    });
    it('should have all of its hosts running on azure', () => {
      cy.get('tr').each(($row, index) => {
        if (index !== 0) {
          expect($row.text()).to.contain('azure');
        }
      });
    });
  });

  describe('Discovered hostnames are the expected ones', () => {
    availableHosts.forEach((hostName) => {
      it(`should have a host named ${hostName}`, () => {
        cy.get('.tn-hostname a').each(($link) => {
          const displayedHostName = $link.text().trim();
          expect(availableHosts).to.include(displayedHostName);
        });
      });
    });
  });
});
