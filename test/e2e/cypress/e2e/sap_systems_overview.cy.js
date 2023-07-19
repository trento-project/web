import {
  availableSAPSystems,
  isHanaInstace,
  isHanaPrimary,
  isHanaSecondary,
  healthMap,
} from '../fixtures/sap-systems-overview/available_sap_systems';

context('SAP Systems Overview', () => {
  before(() => {
    cy.visit('/sap_systems');
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
          const healthClasses = healthMap[health];
          cy.get('.table-fixed')
            .eq(0)
            .find('tr')
            .filter(':visible')
            .eq(index + 1)
            .find('td')
            .as('tableCell');
          cy.get('@tableCell')
            .eq(0)
            .get('svg')
            .should('have.class', healthClasses);
        });
      });
    });

    describe('Links to the details page are the expected ones', () => {
      before(() => {
        cy.navigateToItem('SAP Systems');
        cy.url().should('include', '/sap_systems');
      });

      availableSAPSystems.forEach(({ sid: sid, id: id }) => {
        it(`should have a link to the SAP System with id: ${id}`, () => {
          cy.get('td').contains(sid).click();
          cy.location('pathname').should('eq', `/sap_systems/${id}`);
          cy.go('back');
        });
      });
    });

    describe('Attached databases are the expected ones', () => {
      before(() => {
        cy.navigateToItem('SAP Systems');
        cy.url().should('include', '/sap_systems');
      });
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
      before(() => {
        cy.navigateToItem('SAP Systems');
        cy.url().should('include', '/sap_systems');
      });

      availableSAPSystems.forEach(({ instances: instances }, index) => {
        it(`should show the expected instances details`, () => {
          cy.get('table.table-fixed > tbody > tr')
            .filter(':visible')
            .eq(index)
            .click();
          cy.get('table.table-fixed > tbody > tr')
            .filter(':visible')
            .eq(index)
            .next()
            .find('div.table-row-group > div.table-row')
            .each((row, instanceIndex) => {
              cy.wrap(row).within(() => {
                const healthClasses =
                  healthMap[instances[instanceIndex].health];
                cy.get('div.table-cell')
                  .eq(0)
                  .get('svg')
                  .should('have.class', healthClasses);
                cy.get('div.table-cell')
                  .eq(1)
                  .should('contain', instances[instanceIndex].instanceNumber);
                instances[instanceIndex].features
                  .split('|')
                  .forEach((feature) => {
                    cy.get('div.table-cell').eq(2).should('contain', feature);
                  });
                let columnIndex = 3; // the difference starts at column 3
                if (isHanaInstace(instances[instanceIndex])) {
                  cy.get('div.table-cell')
                    .eq(columnIndex)
                    .should(
                      'contain',
                      instances[instanceIndex].systemReplication
                    );

                  columnIndex = columnIndex + 1;
                }
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
                  .eq(columnIndex + 1)
                  .should('contain', instances[instanceIndex].clusterName);
                cy.get('div')
                  .eq(columnIndex + 2)
                  .should('contain', instances[instanceIndex].hostname);
              });
            });
          // close the collapsible
          cy.get('table.table-fixed > tbody > tr')
            .filter(':visible')
            .eq(index)
            .click();
        });
        it(`should have a link to known type clusters`, () => {
          cy.get('table.table-fixed > tbody > tr')
            .filter(':visible')
            .eq(index)
            .click();
          cy.get('table.table-fixed > tbody > tr')
            .filter(':visible')
            .eq(index)
            .next()
            .find('div.table-row-group > div.table-row')
            .each((row, instanceIndex) => {
              if (!isHanaInstace(instances[instanceIndex])) {
                return;
              }
              cy.wrap(row)
                .get('div.table-cell')
                .contains(instances[instanceIndex].clusterName)
                .click({ force: true });
              cy.location('pathname').should(
                'eq',
                `/clusters/${instances[instanceIndex].clusterID}`
              );
              cy.go('back');
            });
        });
        it(`should have a link to the hosts`, () => {
          cy.get('table.table-fixed > tbody > tr')
            .filter(':visible')
            .eq(index)
            .click();
          cy.get('table.table-fixed > tbody > tr')
            .filter(':visible')
            .eq(index)
            .next()
            .find('div.table-row-group > div.table-row')
            .each((row, instanceIndex) => {
              cy.wrap(row)
                .get('div.table-cell')
                .contains(instances[instanceIndex].hostname)
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

  describe('SAP Systems Tagging', () => {
    before(() => {
      cy.removeTagsFromView();
    });

    availableSAPSystems.forEach(({ sid, tag }) => {
      before(() => {
        cy.navigateToItem('SAP Systems');
        cy.url().should('include', '/sap_systems');
      });
      describe(`Add tag '${tag}' to SAP System with sid: '${sid}'`, () => {
        it(`should tag SAP System '${sid}'`, () => {
          cy.addTagByColumnValue(sid, tag);
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

        cy.get('table.table-fixed > tbody > tr')
          .filter(':visible')
          .eq(0)
          .click();

        cy.get('table.table-fixed > tbody > tr')
          .filter(':visible')
          .eq(0)
          .find('td')
          .eq(0)
          .get('svg')
          .should('have.class', health);
        cy.get('table.table-fixed > tbody > tr')
          .filter(':visible')
          .eq(index)
          .next()
          .get('div.table-row-group > div.table-row')
          .eq(index)
          .get('div.table-cell')
          .eq(0)
          .get('svg')
          .should('have.class', health);

        cy.get('table.table-fixed > tbody > tr')
          .filter(':visible')
          .eq(0)
          .click();
      });
    });

    it(`should have RED health in SAP system and when HANA instance when SAPControl-RED state is received`, () => {
      cy.loadScenario(`sap-systems-overview-hana-RED`);

      const healthClasses = healthMap['RED'];
      cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(0).click();
      cy.get('table.table-fixed > tbody > tr')
        .filter(':visible')
        .eq(0)
        .next()
        .get('div.table-row-group > div.table-row')
        .eq(5)
        .get('div.table-cell')
        .eq(0)
        .get('svg')
        .should('have.class', healthClasses);

      cy.get('table.table-fixed > tbody > tr').filter(':visible').eq(0).click();
    });
  });

  describe('SAP diagnostics agent', () => {
    it(`should skip SAP diagnostics agent discovery visualization`, () => {
      cy.loadScenario('sap-systems-overview-DAA');
      cy.get('table.table-fixed').should('not.contain', 'DAA');
    });
  });

  describe('Deregistration', () => {
    const sapSystemNwp = {
      sid: 'NWP',
      hanaPrimary: {
        name: 'vmhdbprd01',
        id: '9cd46919-5f19-59aa-993e-cf3736c71053',
      },
    };

    const sapSystemNwq = {
      sid: 'NWQ',
      messageserverInstance: {
        name: 'vmnwqas01',
        id: '25677e37-fd33-5005-896c-9275b1284534',
      },
    };

    const sapSystemNwd = {
      sid: 'NWD',
      applicationInstances: [
        {
          name: 'vmnwdev03',
          id: '9a3ec76a-dd4f-5013-9cf0-5eb4cf89898f',
        },
        {
          name: 'vmnwdev04',
          id: '1b0e9297-97dd-55d6-9874-8efde4d84c90',
        },
      ],
    };

    it(`should not display SAP System ${sapSystemNwp.sid} after deregistering the primary instance`, () => {
      cy.deregisterHost(sapSystemNwp.hanaPrimary.id);
      cy.contains(sapSystemNwp.sid).should('not.exist');
    });

    it(`should not display SAP System ${sapSystemNwq.sid} after deregistering the instance running the messageserver`, () => {
      cy.deregisterHost(sapSystemNwq.messageserverInstance.id);
      cy.contains(sapSystemNwq.sid).should('not.exist');
    });

    it(`should not display SAP System ${sapSystemNwd.sid} after deregistering both application instances`, () => {
      cy.deregisterHost(sapSystemNwd.applicationInstances[0].id);
      cy.deregisterHost(sapSystemNwd.applicationInstances[1].id);
      cy.contains(sapSystemNwd.sid).should('not.exist');
    });
  });
});
