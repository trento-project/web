import {
  selectedSystem,
  attachedHosts,
  healthMap,
} from '../fixtures/sap-system-details/selected_system';

context('SAP system details', () => {
  before(() => {
    cy.visit(`/sap_systems/${selectedSystem.Id}`);
    cy.url().should('include', `/sap_systems/${selectedSystem.Id}`);
  });

  describe('SAP system details page is available', () => {
    it(`should display the "${selectedSystem.Sid}" system details page`, () => {
      cy.get('h1').should('contain', 'SAP System Details');
      cy.get('div')
        .contains('Name')
        .next()
        .should('contain', selectedSystem.Sid);
      cy.get('div')
        .contains('Type')
        .next()
        .should('contain', selectedSystem.Type);
    });

    it(`should display "Not found" page when SAP system doesn't exist`, () => {
      cy.visit(`/sap_systems/other`, { failOnStatusCode: false });
      cy.url().should('include', `/sap_systems/other`);
      cy.get('div').should('contain', 'Not Found');
    });
  });

  describe('The system layout shows all the running instances', () => {
    before(() => {
      cy.visit(`/sap_systems/${selectedSystem.Id}`);
      cy.url().should('include', `/sap_systems/${selectedSystem.Id}`);
    });

    after(() => {
      // Restore instance health
      cy.loadScenario('sap-system-detail-GREEN');
    });

    selectedSystem.Hosts.forEach((instance, index) => {
      it(`should show hostname "${instance.Hostname}" with the correct values`, () => {
        cy.get('table.table-fixed')
          .eq(0)
          .find('tr')
          .eq(index + 1)
          .find('td')
          .as('tableCell');
        cy.get('@tableCell').eq(0).should('contain', instance.Hostname);
        cy.get('@tableCell').eq(1).should('contain', instance.Instance);
        instance.Features.split('|').forEach((feature) => {
          cy.get('@tableCell').eq(2).should('contain', feature);
        });
        cy.get('@tableCell').eq(3).should('contain', instance.HttpPort);
        cy.get('@tableCell').eq(4).should('contain', instance.HttpsPort);
        cy.get('@tableCell').eq(5).should('contain', instance.StartPriority);
        cy.get('@tableCell').eq(6).should('contain', instance.Status);
        cy.get('@tableCell')
          .eq(6)
          .find('span')
          .should('have.class', healthMap[instance.StatusBadge]);
      });
    });

    Object.entries(healthMap).forEach(([state, health]) => {
      it(`should show ${state} badge in instance when SAPControl-${state} state is received`, () => {
        cy.loadScenario(`sap-system-detail-${state}`);
        // using row 3 as the changed instance is the 3rd in order based on instance_number
        cy.get('table.table-fixed')
          .eq(0)
          .find('tr')
          .eq(3)
          .find('td')
          .as('tableCell');
        cy.get('@tableCell').eq(6).should('contain', `SAPControl-${state}`);
        cy.get('@tableCell').eq(6).find('span').should('have.class', health);
      });
    });
    /* This test is commented because there is not any option to remove added SAP instances or
    resetting the database afterwards, and it affects the rest of the test suite.
    it(`should show a new instance when an event with a new SAP instance is received`, () => {
      cy.loadScenario(`sap-system-detail-NEW`);
      cy.get('table.table-fixed').eq(0).find('tr').should('have.length', 6);
      cy.get('table.table-fixed')
        .eq(0)
        .find('tr')
        .eq(-1)
        .find('td')
        .as('tableCell');
      cy.get('@tableCell').eq(0).should('contain', 'sapnwdaas1');
      cy.get('@tableCell').eq(1).should('contain', '99');
    });
    */
  });

  describe('The hosts table shows the attached hosts to this SAP system', () => {
    before(() => {
      cy.visit(`/sap_systems/${selectedSystem.Id}`);
      cy.url().should('include', `/sap_systems/${selectedSystem.Id}`);
    });

    attachedHosts.forEach((host, index) => {
      it(`should show ${host.Name} with the data`, () => {
        cy.get('table.table-fixed')
          .eq(1)
          .find('tr')
          .eq(index + 1)
          .find('td')
          .as('tableCell');
        cy.get('@tableCell').eq(0).should('contain', host.Name);
        host.Addresses.forEach((address) => {
          cy.get('@tableCell').eq(1).should('contain', address);
        });
        cy.get('@tableCell').eq(2).should('contain', host.Provider);
        cy.get('@tableCell').eq(3).should('contain', host.Cluster);
        cy.get('@tableCell').eq(4).should('contain', host.Version);
      });

      it(`should have a correct link to the ${host.Name} host`, () => {
        cy.get('table.table-fixed')
          .eq(1)
          .find('tr')
          .eq(index + 1)
          .find('td')
          .as('tableCell');
        cy.get('@tableCell').eq(0).find('a').click();
        cy.location('pathname').should('eq', `/hosts/${host.AgentId}`);
        cy.go('back');
      });
    });
  });
});
