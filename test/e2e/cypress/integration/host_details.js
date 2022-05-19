import { selectedHost } from '../fixtures/host-details/selected_host';

context('Host Details', () => {
  before(() => {
    cy.task('startAgentHeartbeat', [selectedHost.agentId]);
    cy.login();

    cy.visit('/');
    cy.navigateToItem('Hosts');
    cy.get(`#host-${selectedHost.agentId} > a`).click();
    cy.url().should('include', `/hosts/${selectedHost.agentId}`);
  });

  describe('Detailed view for a specific host should be available', () => {
    it('should show the host I clicked on in the overview', () => {
      cy.get('.grid-flow-col > :nth-child(1) > :nth-child(2) > span').should(
        'contain',
        selectedHost.hostName
      );
    });
  });

  describe('SAP instances for this host should be displayed', () => {
    it(`should show SAP instance with ID ${selectedHost.sapInstanceId}`, () => {
      cy.get(
        ':nth-child(6) > .container > :nth-child(2) > .-mx-4 > .min-w-fit > .min-w-full > tbody > tr > :nth-child(1) > .text-gray-900'
      ).should('contain', selectedHost.sapInstanceId);
    });
  });

  describe('Cluster details for this host should be displayed', () => {
    it(`should show a link to the cluster details view for ${selectedHost.clusterName}`, () => {
      cy.get('.text-jungle-green-500')
        .should('contain', selectedHost.clusterName)
        .invoke('attr', 'href')
        .should('include', `/clusters/${selectedHost.clusterId}`);
    });
  });

  describe('Cloud details for this host should be displayed', () => {
    it(`should show ${selectedHost.hostName} under the VM Name`, () => {
      cy.get('.grid-rows-2 > :nth-child(3) > :nth-child(2) > span').should(
        'contain',
        selectedHost.hostName
      );
    });
    it(`should show ${selectedHost.resourceGroup} under the Resource group label`, () => {
      cy.get(':nth-child(5) > :nth-child(2) > span').should(
        'contain',
        selectedHost.resourceGroup
      );
    });
  });

  describe("Trento agent status should be 'running'", () => {
    it("should show the status as 'running'", () => {
      cy.get('span').should('contain', 'Agent: running');
    });
  });

  describe("Node exporter status should be 'running'", () => {
    it("should show the status as 'running'", () => {
      cy.get('span').should('contain', 'Node Exporter: running');
    });
  });
});
