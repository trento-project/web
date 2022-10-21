import {
  availableHosts,
  agents,
} from '../fixtures/hosts-overview/available_hosts';

const availableHosts1stPage = availableHosts.slice(0, 10);

context('Hosts Overview', () => {
  before(() => {
    cy.navigateToItem('Hosts');
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
            cy.get('@hostRow').eq(i).should('contain', host.agentVersion);
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

  describe('Filtering', () => {
    describe('Health', () => {
      const firstHost = availableHosts[0];

      before(() => {
        cy.visit('/hosts');
        cy.task('startAgentHeartbeat', [firstHost.id]);
        cy.get('span').contains('Filter Health').parent().parent().click();
      });

      after(() => {
        cy.task('stopAgentsHeartbeat');
        cy.get('span').contains('Filter Health').parent().parent().click();
      });

      it('should only show the passing host when hosts are filtered by only passing entries', () => {
        cy.get('li > div > span.ml-3.block').contains('passing').click();
        cy.get('.tn-hostname').its('length').should('eq', 1);
        cy.get('.tn-hostname').should('contain', firstHost.name);
        cy.get('li > div > span.ml-3.block').contains('passing').click();
      });

      it('should only show the critical hosts when hosts are filtered by only critical entries', () => {
        cy.get('li > div > span.ml-3.block').contains('critical').click();
        cy.get('.tn-hostname').its('length').should('eq', 10);
        cy.get('.tn-hostname').should('not.contain', firstHost.name);
        cy.get('li > div > span.ml-3.block').contains('critical').click();
      });
    });

    describe('SID', () => {
      before(() => {
        cy.get('span').contains('Filter SID').parent().parent().click();
      });

      after(() => {
        cy.get('span').contains('Filter SID').parent().parent().click();
      });

      ['HDD', 'NWD'].forEach((sid) => {
        it(`should only show the host with the filtered SID ${sid}`, () => {
          const hosts = availableHosts.filter(
            (host) => host.sapSystemSid == sid
          );
          cy.get('li > div > span.ml-3.block').contains(sid).click();
          cy.get('.tn-hostname').its('length').should('eq', hosts.length);
          hosts.forEach((host) => {
            cy.get('.tn-hostname').should('contain', host.name);
          });
          cy.get('li > div > span.ml-3.block').contains(sid).click();
        });
      });

      it('should extract HDD and HWD from query string and put in sid filter', () => {
        cy.visit('/hosts?sid=HDD&sid=NWD');
        cy.get(
          ':nth-child(3) > .mt-1 > .relative > :nth-child(1) > .ml-3'
        ).contains('HDD, NWD');

        // clear
        cy.get('.z-20 > [data-testid="eos-svg-component"]').click();

        cy.url('eq', '/hosts');
      });
    });

    describe('Tags', () => {
      before(() => {
        cy.visit('/hosts');
        cy.removeTagsFromView();
      });

      availableHosts1stPage.forEach(({ name, tag }) => {
        it(`Add tag '${tag}' to host with name: '${name}'`, () => {
          cy.addTagByColumnValue(name, tag);
        });
      });

      describe('Filter by tags', () => {
        before(() => {
          cy.visit('/hosts');
          cy.get('span').contains('Filter Tags').parent().parent().click();
        });

        after(() => {
          cy.get('span').contains('Filter Tags').parent().parent().click();
        });

        ['env1', 'env2', 'env3'].forEach((tag) => {
          it(`should have hosts tagged with tag '${tag}'`, () => {
            const hosts = availableHosts.filter((host) => host.tag == tag);

            cy.get('li > div > span.ml-3.block').contains(tag).click();
            cy.get('.tn-hostname').should('have.length', hosts.length);
            hosts.forEach((host) => {
              cy.get('.tn-hostname').should('contain', host.name);
            });
            cy.get('li > div > span.ml-3.block').contains(tag).click();
          });
        });

        it('should reset the pagination and go the 1st page when a filter is selected', () => {
          const tag = 'env1';

          cy.get('.tn-page-item').eq(2).click();
          cy.get('span').contains('Filter Tags').parent().parent().click();
          cy.get('li > div > span.ml-3.block').contains(tag).click();
          cy.get('.tn-hostname').its('length').should('eq', 4);
          cy.get('li > div > span.ml-3.block').contains(tag).click();
        });

        it('should extract tag1 and tag2 from query string and put in tag filter', () => {
          cy.visit('/hosts?tags=tag1&tags=tag2');
          cy.get(
            ':nth-child(4) > .mt-1 > .relative > :nth-child(1) > .ml-3'
          ).contains('tag1, tag2');

          // clear
          cy.get('.z-20 > [data-testid="eos-svg-component"]').click();
        });
      });
    });
  });
});
