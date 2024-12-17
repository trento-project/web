import { createUserRequestFactory } from '@lib/test-utils/factories';

import {
  availableHosts,
  agents,
} from '../fixtures/hosts-overview/available_hosts';

const availableHosts1stPage = availableHosts.slice(0, 10);

const NEXT_PAGE_SELECTOR = '[aria-label="next-page"]';

context('Hosts Overview', () => {
  before(() => {
    cy.loadScenario('healthy-29-node-SAP-cluster');
    cy.loadScenario('healthy-29-node-SAP-cluster');
    cy.visit('/hosts');
    cy.url().should('include', '/hosts');
  });

  describe('Registered Hosts are shown in the list', () => {
    it('should highlight the hosts sidebar entry', () => {
      cy.get('.tn-menu-item[href="/hosts"]')
        .invoke('attr', 'aria-current')
        .should('eq', 'page');
    });

    it('should show 10 of the 29 registered hosts', () => {
      cy.get('.tn-hostname').its('length').should('eq', 10);
    });

    it('should have 3 pages', () => {
      cy.get(`[data-testid="pagination"]`).as('pagination');
      cy.get(`@pagination`).contains('Showing 1–10 of 29').should('exist');

      cy.get(NEXT_PAGE_SELECTOR).click();
      cy.get(`@pagination`).contains('Showing 11–20 of 29').should('exist');

      cy.get(NEXT_PAGE_SELECTOR).click();
      cy.get(`@pagination`).contains('Showing 21–29 of 29').should('exist');

      cy.get(NEXT_PAGE_SELECTOR).should('be.disabled');
    });

    it('should show the ip addresses, provider and agent version data for the hosts in the 1st page', () => {
      cy.reload();
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
              host.sapSystemSids.forEach((sid, counter) => {
                cy.get('@hostRow').eq(i).should('contain', sid);
                cy.get('@hostRow')
                  .eq(i)
                  .within(() => {
                    cy.contains('a.text-jungle-green-500', sid).click();
                  });
                cy.location('pathname').should(
                  'eq',
                  `/databases/${host.sapSystemId[counter]}`
                );
                cy.go('back');
              });
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

      it('should show health status of the entire cluster of 29 hosts with partial pagination', () => {
        cy.get('.tn-health-container .tn-health-passing', {
          timeout: 15000,
        }).should('contain', 12);
        cy.get('.tn-health-container .tn-health-warning').should('contain', 12);
        cy.get('.tn-health-container .tn-health-critical').should('contain', 5);
      });

      it('should show the correct health on the hosts when the agents are sending the heartbeat', () => {
        cy.get('svg.fill-jungle-green-500').its('length').should('eq', 7);
        cy.get('svg.fill-yellow-500').its('length').should('eq', 2);
      });
    });

    describe('Health is changed based on saptune status when host has SAP', () => {
      const hostWithoutSap = 'vmdrbddev01';

      before(() => {
        cy.visit('/hosts');
        cy.url().should('include', '/hosts');
      });

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
    });

    describe('Health is changed based on saptune status when host has not SAP', () => {
      const hostWithSap = 'vmhdbprd01';

      before(() => {
        cy.visit('/hosts');
        cy.url().should('include', '/hosts');
        cy.get(':nth-child(3) > .tn-page-item').click();
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

      it('should show health status of the entire cluster of 29 hosts with critical health', () => {
        cy.get('.tn-health-container .tn-health-critical', {
          timeout: 15000,
        }).should('contain', 29);
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

        it('should remove the SAP system sid from hosts belonging the deregistered SAP system', () => {
          cy.get(NEXT_PAGE_SELECTOR).click();
          cy.contains('a', sapSystemHostToDeregister.sid).should('exist');
          cy.deregisterHost(sapSystemHostToDeregister.id);
          cy.contains('a', sapSystemHostToDeregister.sid).should('not.exist');
        });
      });

      describe('Movement of application instances on hosts', () => {
        const sapSystemHostsToDeregister = {
          sid: 'NWD',
          movedHostId: 'fb2c6b8a-9915-5969-a6b7-8b5a42de1971',
          initialHostId: '7269ee51-5007-5849-aaa7-7c4a98b0c9ce',
          initialHostname: 'vmnwdev01',
        };

        before(() => {
          cy.visit('/hosts');
          cy.url().should('include', '/hosts');
          cy.loadScenario(
            `sapsystem-${sapSystemHostsToDeregister.sid}-restore`
          );
          cy.loadScenario('sap-systems-overview-moved');
        });

        after(() => {
          cy.loadScenario(
            `sapsystem-${sapSystemHostsToDeregister.sid}-restore`
          );
        });

        it('should associate instances to the correct host during deregistration', () => {
          cy.get(NEXT_PAGE_SELECTOR).click();
          cy.contains('a', sapSystemHostsToDeregister.sid).should('exist');
          cy.deregisterHost(sapSystemHostsToDeregister.movedHostId);
          cy.contains('a', sapSystemHostsToDeregister.sid).should('not.exist');
        });

        it('should complete host deregistration when all instances are moved out', () => {
          cy.contains('a', sapSystemHostsToDeregister.hostname).should('exist');
          cy.deregisterHost(sapSystemHostsToDeregister.initialHostId);
          cy.contains('a', sapSystemHostsToDeregister.initialHostname).should(
            'not.exist'
          );
        });
      });
    });
  });

  describe('Forbidden actions', () => {
    const password = 'password';

    beforeEach(() => {
      cy.deleteAllUsers();
      cy.logout();
      const user = createUserRequestFactory.build({
        password,
        password_confirmation: password,
      });
      cy.wrap(user).as('user');
    });

    describe('Tag creation', () => {
      it('it should prevent a tag update when the user abilities are not compliant', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });

        cy.visit('/hosts');

        cy.contains('span', 'Add Tag').should('have.class', 'opacity-50');
        cy.get('[data-test-id="tag-tag1"]').should('have.class', 'opacity-50');
      });

      it('it should allow a tag update when the user abilities are compliant', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'all', resource: 'host_tags' },
          ]);
          cy.login(user.username, password);
        });

        cy.visit('/hosts');

        cy.contains('span', 'Add Tag').should('not.have.class', 'opacity-50');
        cy.get('[data-test-id="tag-tag1"]').should(
          'not.have.class',
          'opacity-50'
        );
      });
    });

    describe('Clean up', () => {
      it('should forbid host clean up', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });
        cy.visit(`/hosts`);

        cy.contains('button', 'Clean up').should('be.disabled');
      });

      it('should allow host clean up', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'cleanup', resource: 'host' },
          ]);
          cy.login(user.username, password);
        });
        cy.visit(`/hosts`);

        cy.contains('button', 'Clean up').should('be.enabled');
      });
    });
  });
});
