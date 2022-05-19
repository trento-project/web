import { healthMap } from '../fixtures/sap-system-details/selected_system';

import {
  selectedDatabase,
  attachedHosts,
} from '../fixtures/hana-database-details/selected_database';

context('HANA database details', () => {
  const sessionCookie = '_trento_key';

  before(() => {
    cy.login();

    cy.visit(`/databases/${selectedDatabase.Id}`);
    cy.url().should('include', `/databases/${selectedDatabase.Id}`);
  });

  after(() => {
    cy.clearCookie(sessionCookie);
  });

  beforeEach(() => {
    cy.Cookies.preserveOnce(sessionCookie);
  });

  describe('HANA database details page is available', () => {
    it(`should display the "${selectedDatabase.Sid}" database details page`, () => {
      cy.get('h1').should('contain', 'HANA Database Details');
      cy.get('div')
        .contains('Name')
        .next()
        .should('contain', selectedDatabase.Sid);
      cy.get('div')
        .contains('Type')
        .next()
        .should('contain', selectedDatabase.Type);
    });

    it(`should display "Not found" page when HANA database doesn't exist`, () => {
      cy.visit(`/databases/other`, { failOnStatusCode: false });
      cy.url().should('include', `/databases/other`);
      cy.get('div').should('contain', 'Not Found');
    });
  });

  describe('The database layout shows all the running instances', () => {
    before(() => {
      cy.visit(`/databases/${selectedDatabase.Id}`);
      cy.url().should('include', `/databases/${selectedDatabase.Id}`);
    });
    
    after(() => {
      // Restore instance health
      cy.loadScenario('hana-database-detail-GREEN');
    });

    selectedDatabase.Hosts.forEach((instance, index) => {
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
        cy.loadScenario(`hana-database-detail-${state}`);
        // using row 1 as the changed instance is the 3rd in order based on instance_number
        cy.get('table.table-fixed')
          .eq(0)
          .find('tr')
          .eq(1)
          .find('td')
          .as('tableCell');
        cy.get('@tableCell').eq(6).should('contain', `SAPControl-${state}`);
        cy.get('@tableCell').eq(6).find('span').should('have.class', health);
      });
    });
    /* This test is commented because there is not any option to remove added database instances or
    resetting the database afterwards, and it affects the rest of the test suite.
    it(`should show a new instance when an event with a new SAP instance is received`, () => {
      cy.loadScenario(`hana-database-detail-NEW`);
      cy.get('table.table-fixed').eq(0).find('tr').should('have.length', 4);
      cy.get('table.table-fixed')
        .eq(0)
        .find('tr')
        .eq(-1)
        .find('td')
        .as('tableCell');
      cy.get('@tableCell').eq(0).should('contain', 'vmhdbdev02');
      cy.get('@tableCell').eq(1).should('contain', '11');
    });
    */
  });

  describe('The hosts table shows the attached hosts to this HANA database', () => {
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
