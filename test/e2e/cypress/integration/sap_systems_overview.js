import {
  availableSAPSystems,
  isHanaInstace,
  isHanaPrimary,
  isHanaSecondary,
  healthMap,
} from '../fixtures/sap-systems-overview/available_sap_systems';

context('SAP Systems Overview', () => {
  before(() => {
    cy.loadScenario('healthy-27-node-SAP-cluster');
    cy.login();

    cy.visit('/');
    cy.navigateToItem('SAP Systems');
    cy.url().should('include', '/sap_systems');
  });

  describe('Registered SAP Systems should be available in the overview', () => {
    describe('Discovered SID are the expected ones', () => {
      availableSAPSystems.forEach(({ sid: sid }) => {
        it(`should have a sid named ${sid}`, () => {
          cy.get('td').contains(sid);
        });
      });
    });
    
    describe('System healths are the expected ones', () => {
      availableSAPSystems.forEach(({ sid: sid, health: health }, index) => {
        it(`should have a health ${health} for sid ${sid}`, () => {
          const healthClasses = healthMap[health]
          cy.get('.table-fixed')
            .eq(0)
            .find('tr')
            .filter(':visible')
            .eq(index + 1)
            .find('td')
            .as('tableCell');
          cy.get('@tableCell').eq(0).get('svg').should('have.class', healthClasses)
        });
      });
    });

    describe('Links to the details page are the expected ones', () => {
      availableSAPSystems.forEach(({ sid: sid, id: id }) => {
        it(`should have a link to the SAP System with id: ${id}`, () => {
          cy.get('td').contains(sid).click();
          cy.location('pathname').should('eq', `/sap_systems/${id}`);
          cy.go('back');
        });
      });
    });

    describe('Attached databases are the expected ones', () => {
      availableSAPSystems.forEach(
        ({ sid: sid, attachedDatabase: attachedDatabase }) => {
          it(`should show the expected attached database details`, () => {
            cy.get('td')
              .contains(sid)
              .parent('td')
              .parent('tr')
              .within(() => {
                cy.get('td').eq(2).contains(attachedDatabase.sid);
                cy.get('td').eq(3).contains(attachedDatabase.tenant);
                cy.get('td').eq(4).contains(attachedDatabase.dbAddress);
              });
          });
          it(`should have a link to the attached HANA database with id: ${attachedDatabase.id}`, () => {
            cy.contains(attachedDatabase.sid).click();
            cy.location('pathname').should(
              'eq',
              `/databases/${attachedDatabase.id}`
            );
            cy.go('back');
          });
        }
      );
    });

    describe('Instances are the expected ones', () => {
      availableSAPSystems.forEach(({ id: id, sid: sid, instances: instances }, index) => {
        it(`should show the expected instances details`, () => {
          cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(index).click();
          const instancesRow = cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(index).next();
          instancesRow.find('div.table-row-group > div.table-row')
             .each((row, instanceIndex) => {
              cy.wrap(row).within(() => {
                const healthClasses = healthMap[instances[instanceIndex].health]
                cy.get('div.table-cell').eq(0).get('svg').should('have.class', healthClasses)
                cy.get('div.table-cell').eq(1).should('contain', instances[instanceIndex].instanceNumber);
                instances[instanceIndex].features.split("|").forEach((feature) => {
                  cy.get('div.table-cell').eq(2).should('contain', feature);
                });
                let columnIndex = 3; // the difference starts at column 3
                if (isHanaInstace(instances[instanceIndex])) {
                  cy.get('div.table-cell')
                    .eq(columnIndex)
                    .should('contain', instances[instanceIndex].systemReplication);
                  
                  columnIndex = columnIndex + 1;
                };
                if (isHanaPrimary(instances[instanceIndex])) {
                  cy.get('div.table-cell')
                    .eq(columnIndex)
                    .should(
                      'not.contain',
                      instances[instanceIndex].systemReplicationStatus
                    );
                }
                if (isHanaSecondary(instances[instanceIndex])) {
                  cy.get('div')
                    .eq(columnIndex)
                    .should(
                      'contain',
                      instances[instanceIndex].systemReplicationStatus
                    );
                }
                cy.get('div')
                  .eq(columnIndex+1)
                  .should('contain', instances[instanceIndex].clusterName);
                cy.get('div').eq(columnIndex+2).should('contain', instances[instanceIndex].hostname);
              });
            });
            // close the collapsable
            cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(index).click();
        });
        it(`should have a link to known type clusters`, () => {
          cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(index).click();
          const instancesRow = cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(index).next();
          instancesRow.find('div.table-row-group > div.table-row')
             .each((row, instanceIndex) => {
              let columnIndex = 4;
              if (!isHanaInstace(instances[instanceIndex])) {  
                return;
              };
              cy.wrap(row).get('div.table-cell').contains(instances[instanceIndex].clusterName)
              .click({ force: true });
              cy.location('pathname').should(
                'eq',
                `/clusters/${instances[instanceIndex].clusterID}`
              );
              cy.go('back');
             });
        });
        it(`should have a link to the hosts`, () => {
          cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(index).click();
          const instancesRow = cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(index).next();
          instancesRow.find('div.table-row-group > div.table-row')
             .each((row, instanceIndex) => {
              let columnIndex = 4;
              if (isHanaInstace(instances[instanceIndex])) {  
                columnIndex = columnIndex + 1;
              };
              cy.wrap(row).get('div.table-cell').contains(instances[instanceIndex].hostname)
              .click({ force: true });
              cy.location('pathname').should(
                'eq',
                `/hosts/${instances[instanceIndex].hostID}`
              );
              cy.go('back');
             });
        });
      });
    });
  });
  
  describe('Health states are updated', () => {
    Object.entries(healthMap).forEach(([state, health], index) => {
      it(`should have ${state} health in SAP system and instance ${
        index + 1
      } when SAPControl-${state} state is received`, () => {
        cy.loadScenario(`sap-systems-overview-${state}`);

        cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(0).click();
        const instancesRow = cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(index).next();

        cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(0).find('td').eq(0).get('svg').should('have.class', health)
        instancesRow.get('div.table-row-group > div.table-row').eq(index)
            .get('div.table-cell').eq(0).get('svg').should('have.class', health)

        cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(0).click();
      });
    });
  })
});
