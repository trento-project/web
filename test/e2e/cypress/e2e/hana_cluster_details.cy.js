import * as hanaClusterDetailsPage from '../pageObject/hana-cluster-details-po';

import { createUserRequestFactory } from '@lib/test-utils/factories';
import {
  availableHanaCluster,
  availableAngiCluster,
} from '../fixtures/hana-cluster-details/available_hana_cluster';

context('HANA cluster details', () => {
  before(() => {
    hanaClusterDetailsPage.preloadTestData();
  });
  beforeEach(() => {
    hanaClusterDetailsPage.visitAvailableHanaCluster();
    hanaClusterDetailsPage.validateAvailableHanaClusterUrl();
  });

  describe('HANA cluster details should be consistent with the state of the cluster', () => {
    it('should have name expected cluster name in header', () => {
      hanaClusterDetailsPage.expectedClusterNameIsDisplayedInHeader();
    });

    it(`should have expected provider`, () => {
      hanaClusterDetailsPage.expectedProviderIsDisplayed('hana');
    });

    it('should have sid expected SID and href attribute', () => {
      hanaClusterDetailsPage.hasExpectedSidAndHrefAttribute('hana');
    });

    it('should have the expected cluster type', () => {
      hanaClusterDetailsPage.hasExpectedClusterType('hana');
    });

    it('should have expected architecture type', () => {
      hanaClusterDetailsPage.mouseOverArchitectureInfo();
      hanaClusterDetailsPage.architectureTooltipIsDisplayed('hana');
    });

    it('should have expected log replication mode', () => {
      hanaClusterDetailsPage.expectedReplicationModeIsDisplayed('hana');
    });

    it('should have expected fencing type', () => {
      hanaClusterDetailsPage.expectedFencingTypeIsDisplayed('hana');
    });

    it('should have expected HANA secondary sync state', () => {
      hanaClusterDetailsPage.expectedHanaSecondarySyncStateIsDisplayed('hana');
    });

    it('should have expected maintenance mode', () => {
      hanaClusterDetailsPage.expectedMaintenanceModeIsDisplayed('hana');
    });

    it('should have expected hana log operation mode', () => {
      hanaClusterDetailsPage.expectedHanaLogOperationModeIsDisplayed('hana');
    });

    it('should have expected cib last written value', () => {
      hanaClusterDetailsPage.expectedCibLastWrittenValueIsDisplayed('hana');
    });

    it('should have the check overview component with passing checks', () => {
      hanaClusterDetailsPage.expectedPassingChecksCountIsDisplayed();
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    it('should have a working link to the passing checks in the overview component', () => {
      hanaClusterDetailsPage.clickPassingChecksButton();
      hanaClusterDetailsPage.passingChecksUrlIsTheExpected();
    });

    it('should have the check overview component with warning checks', () => {
      hanaClusterDetailsPage.expectedWarningChecksCountIsDisplayed();
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    it('should have a working link to the warning checks in the overview component', () => {
      hanaClusterDetailsPage.clickWarningChecksButton();
      hanaClusterDetailsPage.warningChecksUrlIsTheExpected();
    });

    it('should have the check overview component with critical checks', () => {
      hanaClusterDetailsPage.expectedCriticalChecksCountIsDisplayed();
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    it('should have a working link to the critical checks in the overview component', () => {
      hanaClusterDetailsPage.clickCriticalChecksButton();
      hanaClusterDetailsPage.criticalChecksUrlIsTheExpected();
    });
  });

  describe('Cluster sites should have the expected hosts', () => {
    it('should have expected site name', () => {
      hanaClusterDetailsPage.expectedSiteNamesAreDisplayed();
    });

    it('should have expected site state', () => {
      hanaClusterDetailsPage.expectedSiteStatesAreDisplayed();
    });

    it('should have expected SR health state', () => {
      hanaClusterDetailsPage.expectedSrHealthStatesAreDisplayed();
    });

    it('hosts should have the expected IP addresses', () => {
      hanaClusterDetailsPage.allExpectedIPsAreDisplayed();
    });

    it('hosts should have the expected virtual IP addresses', () => {
      hanaClusterDetailsPage.allExpectedVirtualIPsAreDisplayed();
    });

    it('hosts should have the expected indexserver role', () => {
      hanaClusterDetailsPage.allExpectedIndexServerRolesAreDisplayed();
    });

    it('hosts should have the expected nameserver role', () => {
      hanaClusterDetailsPage.allExpectedNameServerRolesAreDisplayed();
    });

    it('host should have the expected status', () => {
      hanaClusterDetailsPage.allExpectedStatusesAreDisplayed();
    });
  });

  describe('Cluster SBD should have the expected devices with the correct status', () => {
    it('should have SBD expected device name & status', () => {
      hanaClusterDetailsPage.sbdClusterHasExpectedNameAndStatus();
    });
  });

  describe('HANA cluster details in a cost optimized scenario should be consistent with the state of the cluster', () => {
    before(() => {
      hanaClusterDetailsPage.loadScenario('hana-scale-up-cost-opt');
    });

    beforeEach(() => {
      hanaClusterDetailsPage.visitAvailableHanaClusterCostOpt();
      hanaClusterDetailsPage.validateAvailableHanaClusterCostOptUrl();
    });

    // after(() => {
    //   availableHanaClusterCostOpt.hosts.forEach(({ id }) => {
    //     cy.deregisterHost(id);
    //   });
    // });

    it('should have expected name in header', () => {
      hanaClusterDetailsPage.availableHanaClusterCostOpHeaderIsDisplayed();
    });

    it('should have the expected provider', () => {
      hanaClusterDetailsPage.expectedProviderIsDisplayed('hanaCostOpt');
    });

    it('should have all cost optimized SID`s and correct database links', () => {
      hanaClusterDetailsPage.hasExpectedSidsAndHrefAttributes();
    });

    it('should have expected cluster cost optimized type', () => {
      hanaClusterDetailsPage.hasExpectedClusterType('hanaCostOpt');
    });

    it('should have expected architecture type', () => {
      hanaClusterDetailsPage.mouseOverArchitectureInfo();
      hanaClusterDetailsPage.architectureTooltipIsDisplayed('hanaCostOpt');
    });

    it('should have expected log replication mode', () => {
      hanaClusterDetailsPage.expectedReplicationModeIsDisplayed('hanaCostOpt');
    });

    it('should have expected fencing type', () => {
      hanaClusterDetailsPage.expectedFencingTypeIsDisplayed('hanaCostOpt');
    });

    it('should have expected HANA secondary sync state', () => {
      hanaClusterDetailsPage.expectedHanaSecondarySyncStateIsDisplayed(
        'hanaCostOpt'
      );
    });

    it('should have expected maintenance mode', () => {
      hanaClusterDetailsPage.expectedMaintenanceModeIsDisplayed('hanaCostOpt');
    });

    it('should have expected hana log operation mode', () => {
      hanaClusterDetailsPage.expectedHanaLogOperationModeIsDisplayed(
        'hanaCostOpt'
      );
    });

    it('should have expected cib last written', () => {
      hanaClusterDetailsPage.expectedCibLastWrittenValueIsDisplayed(
        'hanaCostOpt'
      );
    });

    it(`should display both SID's in the clusters overview page`, () => {
      hanaClusterDetailsPage.visit();
      hanaClusterDetailsPage.bothHanaCostOptSidsAreDisplayed();
    });
  });

  describe('Angi architecture', () => {
    before(() => {
      cy.loadScenario('hana-scale-up-angi');
      cy.visit(`/clusters/${availableAngiCluster.id}`);
    });

    after(() => {
      availableAngiCluster.hosts.forEach(({ id }) => {
        cy.deregisterHost(id);
      });
    });

    it('should discover and display properly Angi architecture HANA scale up cluster', () => {
      cy.get('h1').contains(availableAngiCluster.name);

      cy.get('.tn-cluster-details')
        .contains('Provider')
        .next()
        .contains(availableAngiCluster.provider);

      cy.get('.tn-cluster-details')
        .contains('SID')
        .next()
        .contains(availableAngiCluster.sid)
        .should(
          'have.attr',
          'href',
          `/databases/${availableAngiCluster.systemID}`
        );

      cy.get('.tn-cluster-details')
        .contains('Cluster type')
        .next()
        .contains(availableAngiCluster.clusterType);

      cy.get('.tn-cluster-details')
        .contains('Cluster type')
        .next()
        .find('svg')
        .trigger('mouseover');

      cy.contains('span', availableAngiCluster.architectureType).should(
        'exist'
      );

      cy.get('.tn-cluster-details')
        .contains('HANA log replication mode')
        .next()
        .contains(availableAngiCluster.hanaSystemReplicationMode);

      cy.get('.tn-cluster-details')
        .contains('Fencing type')
        .next()
        .contains(availableAngiCluster.fencingType);

      cy.get('.tn-cluster-details')
        .contains('HANA secondary sync state')
        .next()
        .contains(availableAngiCluster.hanaSecondarySyncState);

      cy.get('.tn-cluster-details')
        .contains('Cluster maintenance')
        .next()
        .contains('False');

      cy.get('.tn-cluster-details')
        .contains('HANA log operation mode')
        .next()
        .contains(availableAngiCluster.hanaSystemReplicationOperationMode);

      cy.get('.tn-cluster-details')
        .contains('CIB last written')
        .next()
        .contains(availableAngiCluster.cibLastWritten);

      const site1 = availableAngiCluster.sites[0];
      const site2 = availableAngiCluster.sites[1];
      cy.get(`.tn-site-details-${site1.name}`).contains(site1.state);
      cy.get(`.tn-site-details-${site2.name}`).contains(site2.state);
    });

    it('should discover a Angi cluster with failover', () => {
      cy.loadScenario('cluster-hana-scale-up-angi-failover');

      cy.get('.tn-cluster-details')
        .contains('HANA secondary sync state')
        .next()
        .contains('SFAIL');

      const site1 = availableAngiCluster.sites[0];
      const site2 = availableAngiCluster.sites[1];
      cy.get(`.tn-site-details-${site1.name}`).contains('Failed');
      cy.get(`.tn-site-details-${site2.name}`).contains(site1.state);
    });
  });

  // eslint-disable-next-line mocha/no-skipped-tests
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

  // eslint-disable-next-line mocha/no-skipped-tests
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

  // eslint-disable-next-line mocha/no-skipped-tests
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

  // eslint-disable-next-line mocha/no-skipped-tests
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

    describe('Check Execution', () => {
      it('should forbid check execution when the correct user abilities are missing in details and settings', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });

        cy.visit(`/clusters/${availableHanaCluster.id}/settings`);

        cy.contains('button', 'Start Execution').should('be.disabled');

        cy.contains('button', 'Start Execution').click({ force: true });

        cy.contains('span', 'You are not authorized for this action').should(
          'be.visible'
        );

        cy.visit(`/clusters/${availableHanaCluster.id}`);

        cy.contains('button', 'Start Execution').should('be.disabled');

        cy.contains('button', 'Start Execution').click({ force: true });

        cy.contains('span', 'You are not authorized for this action').should(
          'be.visible'
        );
      });

      it('should enable check execution button when the correct user abilities are present', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'all', resource: 'cluster_checks_execution' },
          ]);
          cy.login(user.username, password);
        });

        cy.visit(`/clusters/${availableHanaCluster.id}/settings`);

        cy.contains('button', 'Start Execution').trigger('mouseover', {
          force: true,
        });

        cy.contains('span', 'You are not authorized for this action').should(
          'not.exist'
        );
      });
    });

    describe('Check Selection', () => {
      it('should forbid check selection saving', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });
        cy.visit(`/clusters/${availableHanaCluster.id}/settings`);

        cy.contains('button', 'Save Checks Selection').should('be.disabled');
      });

      it('should allow check selection saving', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'all', resource: 'cluster_checks_selection' },
          ]);
          cy.login(user.username, password);
        });
        cy.visit(`/clusters/${availableHanaCluster.id}/settings`);

        cy.contains('button', 'Save Checks Selection').should('be.enabled');
      });
    });
  });
});
