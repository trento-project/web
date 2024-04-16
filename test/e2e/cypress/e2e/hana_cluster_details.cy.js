import {
  checksExecutionCompletedFactory,
  catalogFactory,
} from '@lib/test-utils/factories';
import { capitalize } from 'lodash';
import { availableHanaCluster } from '../fixtures/hana-cluster-details/available_hana_cluster';

context('HANA cluster details', () => {
  const lastExecutionURL = `**/api/v2/checks/groups/**/executions/last`;
  const lastExecution = checksExecutionCompletedFactory.build({
    group_id: availableHanaCluster.id,
    passing_count: 5,
    warning_count: 3,
    critical_count: 1,
  });
  const catalogURL = `**/api/v3/checks/catalog*`;
  const catalog = catalogFactory.build();

  before(() => {
    cy.intercept(lastExecutionURL, {
      body: lastExecution,
    }).as('lastExecution');
    cy.intercept(catalogURL, { body: catalog }).as('catalog');
    cy.visit(`/clusters/${availableHanaCluster.id}`);
    cy.url().should('include', `/clusters/${availableHanaCluster.id}`);
    cy.wait('@lastExecution');
    cy.wait('@catalog');
  });

  describe('HANA cluster details should be consistent with the state of the cluster', () => {
    it(`should have name ${availableHanaCluster.name} in header`, () => {
      cy.get('h1').contains(availableHanaCluster.name);
    });

    it(`should have provider ${availableHanaCluster.provider}`, () => {
      cy.get('.tn-cluster-details')
        .contains('Provider')
        .next()
        .contains(availableHanaCluster.provider);
    });

    it(`should have sid ${availableHanaCluster.sid}`, () => {
      cy.get('.tn-cluster-details')
        .contains('SID')
        .next()
        .contains(availableHanaCluster.sid)
        .should(
          'have.attr',
          'href',
          `/databases/${availableHanaCluster.systemID}`
        );
    });

    it(`should have cluster type ${availableHanaCluster.clusterType}`, () => {
      cy.get('.tn-cluster-details')
        .contains('Cluster type')
        .next()
        .contains(availableHanaCluster.clusterType);
    });

    it(`should have log replication mode ${availableHanaCluster.hanaSystemReplicationMode}`, () => {
      cy.get('.tn-cluster-details')
        .contains('HANA log replication mode')
        .next()
        .contains(availableHanaCluster.hanaSystemReplicationMode);
    });

    it(`should have fencing type ${availableHanaCluster.fencingType}`, () => {
      cy.get('.tn-cluster-details')
        .contains('Fencing type')
        .next()
        .contains(availableHanaCluster.fencingType);
    });

    it(`should have HANA secondary sync state ${availableHanaCluster.hanaSecondarySyncState}`, () => {
      cy.get('.tn-cluster-details')
        .contains('HANA secondary sync state')
        .next()
        .contains(availableHanaCluster.hanaSecondarySyncState);
    });

    it(`should have maintenance mode ${availableHanaCluster.maintenanceMode}`, () => {
      cy.get('.tn-cluster-details')
        .contains('Cluster maintenance')
        .next()
        .contains('False');
    });

    it(`should have hana log operation mode ${availableHanaCluster.hanaSystemReplicationOperationMode}`, () => {
      cy.get('.tn-cluster-details')
        .contains('HANA log operation mode')
        .next()
        .contains(availableHanaCluster.hanaSystemReplicationOperationMode);
    });

    it(`should have cib last written ${availableHanaCluster.cibLastWritten}`, () => {
      cy.get('.tn-cluster-details')
        .contains('CIB last written')
        .next()
        .contains(availableHanaCluster.cibLastWritten);
    });

    it('should have the check overview component with passing checks', () => {
      cy.get('.tn-cluster-checks-overview ')
        .contains('Passing')
        .parent()
        .next()
        .contains(lastExecution.passing_count);
    });

    it.skip('should have a working link to the passing checks in the overview component', () => {
      cy.get('.tn-cluster-checks-overview ').contains('Passing').click();
      cy.url().should(
        'include',
        `/clusters/${availableHanaCluster.id}/checks/results?health=passing`
      );
      cy.go('back');
    });

    it('should have the check overview component with warning checks', () => {
      cy.get('.tn-cluster-checks-overview ')
        .contains('Warning')
        .parent()
        .next()
        .contains(lastExecution.warning_count);
    });

    it.skip('should have a working link to the warning checks in the overview component', () => {
      cy.get('.tn-cluster-checks-overview ').contains('Warning').click();
      cy.url().should(
        'include',
        `/clusters/${availableHanaCluster.id}/checks/results?health=warning`
      );
      cy.go('back');
    });

    it('should have the check overview component with critical checks', () => {
      cy.get('.tn-cluster-checks-overview ')
        .contains('Critical')
        .parent()
        .next()
        .contains(lastExecution.critical_count);
    });

    it.skip('should have a working link to the critical checks in the overview component', () => {
      cy.get('.tn-cluster-checks-overview ').contains('Critical').click();
      cy.url().should(
        'include',
        `/clusters/${availableHanaCluster.id}/checks/results?health=critical`
      );
      cy.go('back');
    });
  });

  describe('Cluster sites should have the expected hosts', () => {
    availableHanaCluster.sites.forEach((site) => {
      it(`should have ${site.name}`, () => {
        cy.get(`.tn-site-details-${site.name}`).contains(site.name);
      });
      it(`should have ${site.state} state in site ${site.name}`, () => {
        cy.get(`.tn-site-details-${site.name}`).contains(site.state);
      });
      it(`should have correct SR health state in site ${site.name}`, () => {
        cy.get(`.tn-site-details-${site.name}`)
          .find('svg')
          .eq(0)
          .should('have.class', site.srHealthState);
      });

      site.hosts.forEach((host) => {
        it(`${host.hostname} should have the expected IP addresses`, () => {
          host.ips.forEach((ip) => {
            cy.get(`.tn-site-details-${site.name}`).contains(ip);
          });
        });

        it(`${host.hostname} should have the expected virtual IP addresses`, () => {
          host.virtualIps.forEach((ip) => {
            cy.get(`.tn-site-details-${site.name}`).contains(ip);
          });
        });

        it(`${host.hostname} should have the expected indexserver role`, () => {
          cy.get(`.tn-site-details-${site.name}`).contains(
            capitalize(host.indexserver_actual_role)
          );
        });

        it(`${host.hostname} should have the expected nameserver role`, () => {
          cy.get(`.tn-site-details-${site.name}`).contains(
            capitalize(host.nameserver_actual_role)
          );
        });

        it(`${host.hostname} should have the expected status`, () => {
          cy.get(`.tn-site-details-${site.name}`)
            .find('svg')
            .eq(1)
            .should('have.class', host.status);
        });
      });
    });
  });

  describe('Cluster SBD should have the expected devices with the correct status', () => {
    availableHanaCluster.sbd.forEach((item) => {
      it(`should have SBD device name "${item.deviceName}" and status "${item.status}"`, () => {
        cy.get('.tn-sbd-details')
          .contains(item.deviceName)
          .children()
          .contains(item.status);
      });
    });
  });

  describe.skip('Check Selection should allow to enable checks from the checks catalog', () => {
    it('should take me to the cluster settings when pressing the settings button', () => {
      cy.get('button').contains('Check Selection').click();
    });

    it('should include the relevant checks section', () => {
      cy.get('.tn-check-switch').contains('Corosync');
      cy.get('.tn-check-switch').contains('Miscellaneous');
      cy.get('.tn-check-switch').contains('OS and package versions');
      cy.get('.tn-check-switch').contains('Pacemaker');
      cy.get('.tn-check-switch').contains('SBD');
    });

    it('should include the checks catalog in the checks results once enabled', () => {
      cy.get('.tn-check-switch').contains('Corosync');
      cy.get('.tn-check-switch').contains('Miscellaneous');
      cy.get('.tn-check-switch').contains('OS and package versions');
      cy.get('.tn-check-switch').contains('Pacemaker');
      cy.get('.tn-check-switch').contains('SBD');

      cy.get('.tn-check-switch').click({ multiple: true });

      cy.get('button').contains('Select Checks for Execution').click();
      cy.get('.tn-checks-start-execute').click();
      cy.get('.tn-check-result-row').should('have.length', 68);
    });
  });

  describe.skip('Cluster with unknown provider', () => {
    before(() => {
      cy.loadScenario('cluster-unknown-provider');
      cy.visit(`/clusters/${availableHanaCluster.id}`);
    });

    it(`should show a warning message in the check selection view`, () => {
      cy.contains('button', 'Check Selection').click();
      cy.get('[data-testid="warning-banner"]').contains(
        'The following catalog is valid for on-premise bare metal platforms.'
      );
    });

    it(`should show a warning message in the checks results view`, () => {
      cy.visit(`/clusters/${availableHanaCluster.id}/checks/results`);
      cy.get('[data-testid="warning-banner"]').contains(
        'The following results are valid for on-premise bare metal platforms.'
      );
    });
  });

  describe.skip('Cluster with kvm provider', () => {
    before(() => {
      cy.loadScenario('cluster-kvm-provider');
      cy.visit(`/clusters/${availableHanaCluster.id}`);
    });

    it(`should show the default catalog`, () => {
      cy.contains('button', 'Check Selection').click();
      cy.contains('Corosync').click();
      cy.get('li').first().contains(5000);
    });
  });

  describe('Cluster with vmware provider', () => {
    before(() => {
      cy.loadScenario('cluster-vmware-provider');
      cy.visit(`/clusters/${availableHanaCluster.id}`);
    });

    it(`should recognize the provider as vmware`, () => {
      cy.contains('button', 'Check Selection').click();
      cy.contains('VMware');
    });
  });

  describe.skip('Cluster with nutanix provider', () => {
    before(() => {
      cy.loadScenario('cluster-nutanix-provider');
      cy.visit(`/clusters/${availableHanaCluster.id}`);
    });

    it(`should show the default catalog`, () => {
      cy.contains('button', 'Check Selection').click();
      cy.contains('Corosync').click();
      cy.get('li').first().contains(5000);
    });
  });

  describe('Deregistration', () => {
    const hostToDeregister = {
      name: 'vmhdbprd02',
      id: 'b767b3e9-e802-587e-a442-541d093b86b9',
      sid: 'WDF',
    };

    before(() => {
      cy.visit(`/clusters/${availableHanaCluster.id}`);
      cy.url().should('include', `/clusters/${availableHanaCluster.id}`);
    });

    it(`should not include a working link to ${hostToDeregister.name} in the list of sites`, () => {
      cy.deregisterHost(hostToDeregister.id);
      cy.get(`.tn-site-details-${hostToDeregister.sid}`)
        .contains('a', hostToDeregister.name)
        .should('not.exist');
    });

    it(`should show host ${hostToDeregister.name} again with a working link after restoring it`, () => {
      cy.loadScenario(`host-${hostToDeregister.name}-restore`);
      cy.get(`.tn-site-details-${hostToDeregister.sid}`)
        .contains('a', hostToDeregister.name)
        .should('exist');
    });
  });
});
