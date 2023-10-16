import {
  availableHosts,
  agents,
} from '../fixtures/hosts-overview/available_hosts';

const availableHosts1stPage = availableHosts.slice(0, 10);

context('Hosts Overview', () => {
  before(() => {
    cy.visit('/hosts');
    cy.url().should('include', '/hosts');
  });

  describe('Registered Hosts are shown in the list', () => {
    it('should highlight the hosts sidebar entry', () => {
      cy.get('.tn-menu-item[href="/hosts"]')
        .invoke('attr', 'aria-current')
        .should('eq', 'page');
    });
    it('should show 10 of the 27 registered hosts', () => {
      cy.get('.tn-hostname').its('length').should('eq', 10);
    });
    it('should have 3 pages', () => {
      cy.get('.tn-page-item').its('length').should('eq', 3);
    });
    it('should show the ip addresses, provider and agent version data for the hosts in the 1st page', () => {
      cy.get('.container').eq(0).as('hostsTable');
      availableHosts1stPage.forEach((host, index) => {
        cy.get('@hostsTable')
          .find('tr')
          .eq(index + 1)
          .find('td')
          .as('hostRow');

        cy.get('@hostsTable')
          .contains('th', 'IP')
          .invoke('index')
          .then((i) => {
            host.ipAddresses.forEach((ipAddress) => {
              cy.get('@hostRow').eq(i).should('contain', ipAddress);
            });
          });

        cy.get('@hostsTable')
          .contains('th', 'Provider')
          .invoke('index')
          .then((i) => {
            cy.get('@hostRow').eq(i).should('contain', host.provider);
          });

        cy.get('@hostsTable')
          .contains('th', 'Agent version')
          .invoke('index')
          .then((i) => {
            cy.get('@hostRow')
              .eq(i)
              .should('contain', host.agentVersion.slice(0, 15));
          });
      });
    });
    it('should link to the correct host details page clicking in the host name', () => {
      cy.get('.container').eq(0).as('hostsTable');
      availableHosts1stPage.forEach((host, index) => {
        cy.get('@hostsTable')
          .find('tr')
          .eq(index + 1)
          .find('td')
          .as('hostRow');

        cy.get('@hostsTable')
          .contains('th', 'Hostname')
          .invoke('index')
          .then((i) => {
            cy.get('@hostRow').eq(i).should('contain', host.name);
            cy.get('@hostRow').eq(i).click();
            cy.location('pathname').should('eq', `/hosts/${host.id}`);
            cy.go('back');
          });
      });
    });
    it('should link to the correct cluster details page clicking in the cluster name', () => {
      cy.get('.container').eq(0).as('hostsTable');
      availableHosts1stPage.forEach((host, index) => {
        cy.get('@hostsTable')
          .find('tr')
          .eq(index + 1)
          .find('td')
          .as('hostRow');

        cy.get('@hostsTable')
          .contains('th', 'Cluster')
          .invoke('index')
          .then((i) => {
            if (host.clusterId) {
              cy.get('@hostRow').eq(i).should('contain', host.clusterName);
              cy.get('@hostRow').eq(i).click();
              cy.location('pathname').should(
                'eq',
                `/clusters/${host.clusterId}`
              );
              cy.go('back');
            } else {
              cy.get('@hostRow').eq(i).find('a').should('not.exist');
            }
          });
      });
    });
    it('should link to the correct sap system details page clicking in the sap system name', () => {
      cy.get('.container').eq(0).as('hostsTable');
      availableHosts1stPage.forEach((host, index) => {
        cy.get('@hostsTable')
          .find('tr')
          .eq(index + 1)
          .find('td')
          .as('hostRow');

        cy.get('@hostsTable')
          .contains('th', 'SID')
          .invoke('index')
          .then((i) => {
            if (host.clusterId) {
              cy.get('@hostRow').eq(i).should('contain', host.sapSystemSid);
              cy.get('@hostRow').eq(i).click();
              cy.location('pathname').should(
                'eq',
                `/databases/${host.sapSystemId}`
              );
              cy.go('back');
            } else {
              cy.get('@hostRow').eq(i).find('a').should('not.exist');
            }
          });
      });
    });
  });

  describe('Health Detection', () => {
    describe('Health Container shows the health overview of the deployed landscape', () => {
      before(() => {
        cy.visit('/hosts');
        cy.url().should('include', '/hosts');
        cy.task('startAgentHeartbeat', agents());
      });

      it('should show health status of the entire cluster of 27 hosts with partial pagination', () => {
        cy.get('.tn-health-container .tn-health-passing', {
          timeout: 15000,
        }).should('contain', 27);
        cy.get('.tn-health-container .tn-health-warning').should('contain', 0);
        cy.get('.tn-health-container .tn-health-critical').should('contain', 0);
      });

      it('should show a passing health on the hosts when the agents are sending the heartbeat', () => {
        cy.get('svg.fill-jungle-green-500').its('length').should('eq', 10);
      });
    });
    describe('Health is changed based on saptune status', () => {
      const hostWithoutSap = 'vmdrbddev01';
      const hostWithSap = 'vmhdbdev01';

      it('should not change the health if saptune is not installed and a SAP workload is not running', () => {
        cy.loadScenario(`host-${hostWithoutSap}-saptune-uninstalled`);
        cy.contains('tr', hostWithoutSap).within(() => {
          cy.get('td:nth-child(1) svg').should(
            'have.class',
            'fill-jungle-green-500'
          );
        });
      });

      it('should not change the health if saptune is installed and a SAP workload is not running', () => {
        cy.loadScenario(`host-${hostWithoutSap}-saptune-not-tuned`);
        cy.contains('tr', hostWithoutSap).within(() => {
          cy.get('td:nth-child(1) svg').should(
            'have.class',
            'fill-jungle-green-500'
          );
        });
      });

      it('should change the health to warning if saptune is not installed', () => {
        cy.loadScenario(`host-${hostWithSap}-saptune-uninstalled`);
        cy.contains('tr', hostWithSap).within(() => {
          cy.get('td:nth-child(1) svg').should('have.class', 'fill-yellow-500');
        });
      });

      it('should change the health to warning if saptune version is unsupported', () => {
        cy.loadScenario(`host-${hostWithSap}-saptune-unsupported`);
        cy.contains('tr', hostWithSap).within(() => {
          cy.get('td:nth-child(1) svg').should('have.class', 'fill-yellow-500');
        });
      });

      [
        {
          state: 'not compliant',
          scenario: 'not-compliant',
          health: 'critical',
          icon: 'fill-red-500',
        },
        {
          state: 'not tuned',
          scenario: 'not-tuned',
          health: 'warning',
          icon: 'fill-yellow-500',
        },
        {
          state: 'compliant',
          scenario: 'compliant',
          health: 'passing',
          icon: 'fill-jungle-green-500',
        },
      ].forEach(({ state, scenario, health, icon }) => {
        it(`should change the health to ${health} if saptune tuning state is ${state}`, () => {
          cy.loadScenario(`host-${hostWithSap}-saptune-${scenario}`);
          cy.contains('tr', hostWithSap).within(() => {
            cy.get('td:nth-child(1) svg').should('have.class', icon);
          });
        });
      });
    });
    describe('Health is changed to critical when the heartbeat is not sent', () => {
      before(() => {
        cy.visit('/hosts');
        cy.task('stopAgentsHeartbeat');
      });
      it('should show health status of the entire cluster of 27 hosts with critical health', () => {
        cy.get('.tn-health-container .tn-health-critical', {
          timeout: 15000,
        }).should('contain', 27);
      });

      it('should show a critical health on the hosts when the agents are not sending the heartbeat', () => {
        cy.get('svg.fill-red-500').its('length').should('eq', 10);
      });
    });
  });

  describe('Deregistration', () => {
    const hostToDeregister = {
      name: 'vmhdbdev01',
      id: '13e8c25c-3180-5a9a-95c8-51ec38e50cfc',
      tag: 'tag1',
    };

    describe('Clean-up buttons should be visible only when needed', () => {
      before(() => {
        cy.visit('/hosts');
        cy.url().should('include', '/hosts');
        cy.task('startAgentHeartbeat', [hostToDeregister.id]);
      });

      it(`should not display a clean-up button for host ${hostToDeregister.name}`, () => {
        cy.contains(hostToDeregister.name).within(() => {
          cy.get('td:nth-child(9)').should('not.exist');
        });
      });

      it('should show all other cleanup buttons', () => {
        cy.get('tbody tr')
          .find('button')
          .should('have.length', 9)
          .contains('Clean up');
      });
    });

    describe('Clean-up button should deregister a host', () => {
      before(() => {
        cy.visit('/hosts');
        cy.url().should('include', '/hosts');
        cy.task('stopAgentsHeartbeat');
        cy.addTagByColumnValue(hostToDeregister.name, hostToDeregister.tag);
      });

      it('should allow to deregister a host after clean up confirmation', () => {
        cy.contains(
          `The host ${hostToDeregister.name} heartbeat is failing`
        ).should('exist');

        cy.contains('tr', hostToDeregister.name).within(() => {
          cy.get('td:nth-child(9)')
            .contains('Clean up', { timeout: 15000 })
            .click();
        });

        cy.get('#headlessui-portal-root').as('modal');

        cy.get('@modal')
          .find('.w-full')
          .should(
            'contain.text',
            `Clean up data discovered by agent on host ${hostToDeregister.name}`
          );

        cy.get('@modal').contains('button', 'Clean up').click();

        cy.get(`#host-${hostToDeregister.id}`).should('not.exist');
      });

      describe('Restoration', () => {
        it(`should show host ${hostToDeregister.name} registered again after restoring the host with the tag`, () => {
          cy.loadScenario(`host-${hostToDeregister.name}-restore`);
          cy.contains(hostToDeregister.name).should('exist');
          cy.contains('tr', hostToDeregister.name).within(() => {
            cy.contains(hostToDeregister.tag).should('exist');
          });
        });
      });

      describe('Deregistration of hosts should update remaining hosts data', () => {
        const sapSystemHostToDeregister = {
          id: '7269ee51-5007-5849-aaa7-7c4a98b0c9ce',
          sid: 'NWD',
        };

        before(() => {
          cy.visit('/hosts');
          cy.url().should('include', '/hosts');
          cy.loadScenario(`sapsystem-${sapSystemHostToDeregister.sid}-restore`);
        });

        beforeEach(() => {
          cy.contains('button', '1').click(); // Move to 1st host list view page
        });

        it('should remove the SAP system sid from hosts belonging the deregistered SAP system', () => {
          cy.contains('button', '2').click();
          cy.contains('a', sapSystemHostToDeregister.sid).should('exist');
          cy.deregisterHost(sapSystemHostToDeregister.id);
          cy.contains('a', sapSystemHostToDeregister.sid).should('not.exist');
        });
      });
    });
  });
});
