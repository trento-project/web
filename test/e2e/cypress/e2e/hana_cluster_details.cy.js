const availableHanaCluster = {
  id: 'd2522281-2c76-52dc-8500-10bdf2cc6664',
  name: 'hana_cluster',
  provider: 'AWS',
  sid: 'PRD',
  clusterType: 'HANA scale-up',
  hanaSystemReplicationMode: 'sync',
  fencingType: 'external/ec2',
  hanaSecondarySyncState: 'SOK',
  sapHanaSRHealthState: 4,
  // cibLastWritten: 'Tue Jan 25 15:36:59 2022',
  hanaSystemReplicationOperationMode: 'logreplay',
  sites: [
    {
      name: 'NBG',
      hosts: [
        {
          hostname: 'vmhdbprd01',
          ips: ['10.80.1.11', '10.80.1.13'],
          virtualIps: ['10.80.1.13'],
          role: 'Primary',
          attributes: [
            {
              attribute: 'hana_hdp_clone_state',
              value: 'PROMOTED',
            },
            {
              attribute: 'hana_hdp_op_mode',
              value: 'logreplay',
            },
            {
              attribute: 'hana_hdp_remoteHost',
              value: 'vmhdbprd02',
            },
            {
              attribute: 'hana_hdp_roles',
              value: '4:P:master1:master:worker:master',
            },
            {
              attribute: 'hana_hdp_site',
              value: 'NBG',
            },
            {
              attribute: 'hana_hdp_srmode',
              value: 'sync',
            },
            {
              attribute: 'hana_hdp_sync_state',
              value: 'PRIM',
            },
            {
              attribute: 'hana_hdp_version',
              value: '2.00.057.00.1629894416',
            },
            {
              attribute: 'hana_hdp_vhost',
              value: 'vmhdbprd01',
            },
            {
              attribute: 'lpa_hdp_lpt',
              value: '1643125019',
            },
            {
              attribute: 'master-rsc_SAPHana_HDP_HDB10',
              value: '150',
            },
          ],
          resources: [
            {
              id: 'stonith-sbd',
              type: 'stonith:external/sbd',
              role: 'Started',
              status: 'Active',
              failCount: '0',
            },
            {
              id: 'rsc_ip_HDP_HDB10',
              type: 'ocf::heartbeat:IPaddr2',
              role: 'Started',
              status: 'Active',
              failCount: '0',
            },
            {
              id: 'rsc_socat_HDP_HDB10',
              type: 'ocf::heartbeat:azure-lb',
              role: 'Started',
              status: 'Active',
              failCount: '0',
            },
            {
              id: 'rsc_SAPHana_HDP_HDB10',
              type: 'ocf::suse:SAPHana',
              role: 'Master',
              status: 'Active',
              failCount: '0',
            },
            {
              id: 'rsc_SAPHanaTopology_HDP_HDB10',
              type: 'ocf::suse:SAPHanaTopology',
              role: 'Started',
              status: 'Active',
              failCount: '0',
            },
          ],
        },
      ],
    },
    {
      name: 'WDF',
      hosts: [
        {
          hostname: 'vmhdbprd02',
          ips: ['10.80.1.12'],
          virtualIps: [],
          role: 'Secondary',
          attributes: [
            {
              attribute: 'hana_hdp_clone_state',
              value: 'DEMOTED',
            },
            {
              attribute: 'hana_hdp_op_mode',
              value: 'logreplay',
            },
            {
              attribute: 'hana_hdp_remoteHost',
              value: 'vmhdbprd01',
            },
            {
              attribute: 'hana_hdp_roles',
              value: '4:S:master1:master:worker:master',
            },
            {
              attribute: 'hana_hdp_site',
              value: 'WDF',
            },
            {
              attribute: 'hana_hdp_srmode',
              value: 'sync',
            },
            {
              attribute: 'hana_hdp_sync_state',
              value: 'SOK',
            },
            {
              attribute: 'hana_hdp_version',
              value: '2.00.057.00.1629894416',
            },
            {
              attribute: 'hana_hdp_vhost',
              value: 'vmhdbprd02',
            },
            {
              attribute: 'lpa_hdp_lpt',
              value: '30',
            },
            {
              attribute: 'master-rsc_SAPHana_HDP_HDB10',
              value: '100',
            },
          ],
          resources: [
            {
              id: 'rsc_SAPHana_HDP_HDB10',
              type: 'ocf::suse:SAPHana',
              role: 'Slave',
              status: 'Active',
              failCount: '0',
            },
            {
              id: 'rsc_SAPHanaTopology_HDP_HDB10',
              type: 'ocf::suse:SAPHanaTopology',
              role: 'Started',
              status: 'Active',
              failCount: '0',
            },
          ],
        },
      ],
    },
  ],
  sbd: [
    {
      deviceName:
        '/dev/disk/by-id/scsi-SLIO-ORG_IBLOCK_8d286026-c3a6-4404-90ac-f2549b924e77',
      status: 'Healthy',
    },
    {
      deviceName:
        '/dev/disk/by-id/scsi-SLIO-ORG_IBLOCK_8d286026-c3a6-4404-90ac-f2549b912345',
      status: 'Unhealthy',
    },
    {
      deviceName:
        '/dev/disk/by-id/scsi-SLIO-ORG_IBLOCK_8d286026-c3a6-4404-90ac-f2549b954321',
      status: 'Unhealthy',
    },
  ],
};

const lastExecution = {};

// if (Cypress.env('REAL_CLUSTER_TESTS')) {
context('HANA cluster details', () => {
  // const lastExecutionURL = `**/api/v1/checks/groups/**/executions/last`;
  // const lastExecution = checksExecutionCompletedFactory.build({
  //   group_id: availableHanaCluster.id,
  //   passing_count: 5,
  //   warning_count: 3,
  //   critical_count: 1,
  // });

  describe('HANA cluster details should be consistent with the state of the cluster', () => {
    beforeEach(() => {
      // cy.intercept(lastExecutionURL, {
      //   body: lastExecution,
      // }).as('lastExecution');
      cy.visit(`/clusters/${availableHanaCluster.id}`);
      cy.url().should('include', `/clusters/${availableHanaCluster.id}`);
      cy.wait('@lastExecution');
    });

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

    // it(`should have cib last written ${availableHanaCluster.cibLastWritten}`, () => {
    //   cy.get('.tn-cluster-details')
    //     .contains('CIB last written')
    //     .next()
    //     .contains(availableHanaCluster.cibLastWritten);
    // });

    it('should have the check overview component with passing checks', () => {
      cy.get('.tn-cluster-checks-overview ')
        .contains('Passing')
        .parent()
        .next()
        .contains(lastExecution.passing_count);
    });

    it('should have a working link to the passing checks in the overview component', () => {
      cy.get('.tn-cluster-checks-overview ').contains('Passing').click();
      cy.url().should(
        'include',
        `/clusters/${availableHanaCluster.id}/executions/last?health=passing`
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

    it('should have a working link to the warning checks in the overview component', () => {
      cy.get('.tn-cluster-checks-overview ').contains('Warning').click();
      cy.url().should(
        'include',
        `/clusters/${availableHanaCluster.id}/executions/last?health=warning`
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

    it('should have a working link to the critical checks in the overview component', () => {
      cy.get('.tn-cluster-checks-overview ').contains('Critical').click();
      cy.url().should(
        'include',
        `/clusters/${availableHanaCluster.id}/executions/last?health=critical`
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
    // const checksCatalogURL = `**/api/v1/checks/catalog`;

    // const group1 = catalogCheckFactory.buildList(2, { group: 'Group 1' });
    // const group2 = catalogCheckFactory.buildList(2, { group: 'Group 2' });
    // const group3 = catalogCheckFactory.buildList(2, { group: 'Group 3' });
    // const catalog = group1.concat(group2, group3);

    // Catalog need to be mocked
    // beforeEach(() => {
    //   cy.intercept(checksCatalogURL, {
    //     body: { items: catalog },
    //   }).as('catalog');
    //   cy.wait('@catalog');
    // });

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
      cy.visit(`/clusters/${availableHanaCluster.id}/executions/last`);
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
      cy.get('li').first().contains(5000);
    });
  });

  describe('Cluster with vmware provider', () => {
    before(() => {
      cy.loadScenario('cluster-vmware-provider');
      cy.visit(`/clusters/${availableHanaCluster.id}`);
    });

    it(`should recognize the provider as vmware`, () => {
      cy.contains('button', 'Settings').click();
      cy.contains('VMware');
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
      cy.get('li').first().contains(5000);
    });
  });
});
// }
