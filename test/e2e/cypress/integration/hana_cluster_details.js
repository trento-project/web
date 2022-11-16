import { availableHanaCluster } from '../fixtures/hana-cluster-details/available_hana_cluster';

import { checkDataByProvider } from '../fixtures/checks-catalog/available_checks';

context('HANA database details', () => {
  before(() => {
    cy.visit(`/clusters/${availableHanaCluster.id}`);
    cy.url().should('include', `/clusters/${availableHanaCluster.id}`);
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
        .contains(availableHanaCluster.sid);
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

    it(`should have sap hana sr health state ${availableHanaCluster.sapHanaSRHealthState}`, () => {
      cy.get('.tn-cluster-details')
        .contains('SAPHanaSR health state')
        .next()
        .contains(availableHanaCluster.sapHanaSRHealthState);
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
      cy.get('.tn-cluster-checks-overview ').contains('Passing');
    });

    it('should have a working link to the passing checks in the overview component', () => {
      cy.get('.tn-cluster-checks-overview ').contains('Passing').click();
      cy.url().should(
        'include',
        `/clusters/${availableHanaCluster.id}/checks/results?health=passing`
      );
      cy.go('back');
    });

    it('should have the check overview component with warning checks', () => {
      cy.get('.tn-cluster-checks-overview ').contains('Warning');
    });

    it('should have a working link to the warning checks in the overview component', () => {
      cy.get('.tn-cluster-checks-overview ').contains('Warning').click();
      cy.url().should(
        'include',
        `/clusters/${availableHanaCluster.id}/checks/results?health=warning`
      );
      cy.go('back');
    });

    it('should have the check overview component with critical checks', () => {
      cy.get('.tn-cluster-checks-overview ').contains('Critical');
    });

    it('should have a working link to the critical checks in the overview component', () => {
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

        it(`${host.hostname} should have the expected role`, () => {
          cy.get(`.tn-site-details-${site.name}`).contains(host.role);
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

  describe('Settings should allow to enable checks from the checks catalog', () => {
    it('should take me to the cluster settings when pressing the settings button', () => {
      cy.get('button').contains('Settings').click();
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

  describe('Cluster with unknown provider', () => {
    before(() => {
      cy.loadScenario('cluster-unknown-provider');
      cy.visit(`/clusters/${availableHanaCluster.id}`);
    });

    it(`should show a warning message in the check selection view`, () => {
      cy.contains('button', 'Settings').click();
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

  describe('Cluster with kvm provider', () => {
    before(() => {
      cy.loadScenario('cluster-kvm-provider');
      cy.visit(`/clusters/${availableHanaCluster.id}`);
    });

    it(`should show the default catalog`, () => {
      cy.contains('button', 'Settings').click();
      cy.contains('Corosync').click();
      cy.get('li').first().contains(checkDataByProvider.get('default'));
    });
  });

  describe('Cluster with nutanix provider', () => {
    before(() => {
      cy.loadScenario('cluster-nutanix-provider');
      cy.visit(`/clusters/${availableHanaCluster.id}`);
    });

    it(`should show the default catalog`, () => {
      cy.contains('button', 'Settings').click();
      cy.contains('Corosync').click();
      cy.get('li').first().contains(checkDataByProvider.get('default'));
    });
  });
});
