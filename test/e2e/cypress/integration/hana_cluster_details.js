import { availableHanaCluster } from '../fixtures/hana-cluster-details/available_hana_cluster';

context('HANA database details', () => {
  before(() => {
    cy.loadScenario('healthy-27-node-SAP-cluster');
    cy.login();
    cy.visit(`/clusters/${availableHanaCluster.id}`);
    cy.url().should('include', `/clusters/${availableHanaCluster.id}`);
  });

  describe('HANA cluster details should be consistent with the state of the cluster', () => {
    it(`should have name ${availableHanaCluster.name}`, () => {
      cy.get('div')
        .contains('Cluster name')
        .next()
        .contains(availableHanaCluster.name);
    });

    it(`should have sid ${availableHanaCluster.sid}`, () => {
      cy.get('div').contains('SID').next().contains(availableHanaCluster.sid);
    });

    it(`should have cluster type ${availableHanaCluster.clusterType}`, () => {
      cy.get('div')
        .contains('Cluster type')
        .next()
        .contains(availableHanaCluster.clusterType);
    });

    it(`should have log replication mode ${availableHanaCluster.hanaSystemReplicationMode}`, () => {
      cy.get('div')
        .contains('HANA log replication mode')
        .next()
        .contains(availableHanaCluster.hanaSystemReplicationMode);
    });

    it(`should have fencing type ${availableHanaCluster.fencingType}`, () => {
      cy.get('div')
        .contains('Fencing type')
        .next()
        .contains(availableHanaCluster.fencingType);
    });

    it(`should have HANA secondary sync state ${availableHanaCluster.hanaSecondarySyncState}`, () => {
      cy.get('div')
        .contains('HANA secondary sync state')
        .next()
        .contains(availableHanaCluster.hanaSecondarySyncState);
    });

    it(`should have sap hana sr health state ${availableHanaCluster.sapHanaSRHealthState}`, () => {
      cy.get('div')
        .contains('SAPHanaSR health state')
        .next()
        .contains(availableHanaCluster.sapHanaSRHealthState);
    });

    it(`should have hana log operation mode ${availableHanaCluster.hanaSystemReplicationOperationMode}`, () => {
      cy.get('div')
        .contains('HANA log operation mode')
        .next()
        .contains(availableHanaCluster.hanaSystemReplicationOperationMode);
    });
  });

  describe('Cluster sites should have the expected hosts', () => {
    availableHanaCluster.sites.forEach((site) => {
      it(`should have ${site.name}`, () => {
        cy.get('h3').contains(site.name);
      });

      site.hosts.forEach((host) => {
        it(`${host.hostname} should have the expected IP addresses`, () => {
          host.ips.forEach((ip) => {
            cy.get('h3').contains(site.name).siblings().find('td').contains(ip);
          });
        });

        it(`${host.hostname} should have the expected virtual IP addresses`, () => {
          host.virtualIps.forEach((ip) => {
            cy.get('h3').contains(site.name).siblings().find('p').contains(ip);
          });
        });

        it(`${host.hostname} should have the expected role`, () => {
          cy.get('h3')
            .contains(site.name)
            .siblings()
            .find('p')
            .contains(host.role);
        });
      });
    });
  });

  describe('Cluster SBD should have the expected devices with the correct status', () => {
    availableHanaCluster.sbd.forEach((item) => {
      it(`should have SBD device name "${item.deviceName}" and status "${item.status}"`, () => {
        cy.get('div > div > h2')
          .contains('SBD/Fencing')
          .parent()
          .parent()
          .next()
          .find('div')
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
      cy.get('div > h3').contains('Corosync');
      cy.get('div > h3').contains('Miscellaneous');
      cy.get('div > h3').contains('OS and package versions');
      cy.get('div > h3').contains('Pacemaker');
      cy.get('div > h3').contains('SBD');
    });

    it('should include the checks catalog in the checks results once enabled', () => {
      cy.get('div > h3')
        .contains('Corosync')
        .parent()
        .siblings()
        .find('button')
        .click();
      cy.get('div > h3')
        .contains('Miscellaneous')
        .parent()
        .siblings()
        .find('button')
        .click();
      cy.get('div > h3')
        .contains('OS and package versions')
        .parent()
        .siblings()
        .find('button')
        .click();
      cy.get('div > h3')
        .contains('Pacemaker')
        .parent()
        .siblings()
        .find('button')
        .click();
      cy.get('div > h3')
        .contains('SBD')
        .parent()
        .siblings()
        .find('button')
        .click();
      cy.get('button').contains('Select Checks for Execution').click();
      cy.get('p')
        .contains('Well done! To start execution now, click here 👉')
        .siblings()
        .first()
        .click();
      cy.get('div').find('tr').should('have.length', 72);
    });
  });
});
