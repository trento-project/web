import * as hanaClusterDetailsPage from '../pageObject/hana-cluster-details-po';

import { availableHanaCluster } from '../fixtures/hana-cluster-details/available_hana_cluster';

context('HANA cluster details', () => {
  before(() => {
    // hanaClusterDetailsPage.preloadTestData();
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
      hanaClusterDetailsPage.loadScenario('hana-scale-up-angi');
    });

    beforeEach(() => {
      hanaClusterDetailsPage.visitHanaAngiCluster();
    });

    // after(() => {
    //   availableAngiCluster.hosts.forEach(({ id }) => {
    //     cy.deregisterHost(id);
    //   });
    // });

    it('should have expected name in header', () => {
      hanaClusterDetailsPage.availableHanaAngiHeaderIsDisplayed();
    });

    it('should have the expected provider', () => {
      hanaClusterDetailsPage.expectedProviderIsDisplayed('angi');
    });

    it('should have all cost optimized SID`s and correct database links', () => {
      hanaClusterDetailsPage.hasExpectedSidAndHrefAttribute('angi');
    });

    it('should have expected cluster cost optimized type', () => {
      hanaClusterDetailsPage.hasExpectedClusterType('angi');
    });

    it('should have expected architecture type', () => {
      hanaClusterDetailsPage.mouseOverArchitectureInfo();
      hanaClusterDetailsPage.architectureTooltipIsDisplayed('angi');
    });

    it('should have expected log replication mode', () => {
      hanaClusterDetailsPage.expectedReplicationModeIsDisplayed('angi');
    });

    it('should have expected fencing type', () => {
      hanaClusterDetailsPage.expectedFencingTypeIsDisplayed('angi');
    });

    it('should have expected HANA secondary sync state', () => {
      hanaClusterDetailsPage.expectedHanaSecondarySyncStateIsDisplayed('angi');
    });

    it('should have expected maintenance mode', () => {
      hanaClusterDetailsPage.expectedMaintenanceModeIsDisplayed('angi');
    });

    it('should have expected hana log operation mode', () => {
      hanaClusterDetailsPage.expectedHanaLogOperationModeIsDisplayed('angi');
    });

    it('should have expected cib last written', () => {
      hanaClusterDetailsPage.expectedCibLastWrittenValueIsDisplayed('angi');
    });

    it('should discover and display properly Angi architecture HANA scale up cluster', () => {
      hanaClusterDetailsPage.hanaAngiClusterSitesAreDisplayed();
    });

    it('should discover a Angi cluster with failover', () => {
      hanaClusterDetailsPage.loadScenario(
        'cluster-hana-scale-up-angi-failover'
      );
      hanaClusterDetailsPage.expectedHanaSecondarySyncStateIsDisplayed('SFAIL');
      hanaClusterDetailsPage.hanaAngiSitesHaveExpectedStateAfterFailover();
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
      hanaClusterDetailsPage.loadScenario('cluster-vmware-provider');
      hanaClusterDetailsPage.interceptGroupChecksEndpoint();
      hanaClusterDetailsPage.visitAvailableHanaCluster();
    });

    it(`should recognize the provider as vmware`, () => {
      hanaClusterDetailsPage.clickCheckSelectionButton();
      hanaClusterDetailsPage.waitForGroupChecksEndpoint();
      hanaClusterDetailsPage.expectedProviderIsDisplayed('VMware');
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
    beforeEach(() => {
      hanaClusterDetailsPage.visitAvailableHanaCluster();
    });

    it('should not include a working link to the deregistered host in the list of sites', () => {
      hanaClusterDetailsPage.linkToDeregisteredHostIsAvailable();
      hanaClusterDetailsPage.apiDeregisterWdfHost();
      hanaClusterDetailsPage.linkToDeregisteredHostIsNotAvailable();
    });

    it(`should show host again with a working link after restoring it`, () => {
      hanaClusterDetailsPage.apiRestoreWdfHost();
      hanaClusterDetailsPage.linkToDeregisteredHostIsAvailable();
    });
  });

  describe('Forbidden actions', () => {
    beforeEach(() => {
      hanaClusterDetailsPage.apiDeleteAllUsers();
      hanaClusterDetailsPage.logout();
    });

    describe('Check Execution', () => {
      it('should forbid check execution when the correct user abilities are missing in details and settings', () => {
        hanaClusterDetailsPage.apiCreateUserWithoutAbilities();
        hanaClusterDetailsPage.loginWithoutAbilities();
        hanaClusterDetailsPage.visitAvailableHanaCluster();
        hanaClusterDetailsPage.startExecutionButtonIsDisabled();
        hanaClusterDetailsPage.clickStartExecutionButton();
        hanaClusterDetailsPage.notAuthorizedTooltipIsDisplayed();
        hanaClusterDetailsPage.clickCheckSelectionButton();
        hanaClusterDetailsPage.startExecutionButtonIsDisabled();
        hanaClusterDetailsPage.clickStartExecutionButton();
        hanaClusterDetailsPage.notAuthorizedTooltipIsDisplayed();
      });

      it('should enable check execution button when the correct user abilities are present', () => {
        hanaClusterDetailsPage.apiCreateUserWithChecksAbility();
        hanaClusterDetailsPage.loginWithAbilities();
        hanaClusterDetailsPage.visitAvailableHanaCluster();
        hanaClusterDetailsPage.clickCheckSelectionButton();
        hanaClusterDetailsPage.mouseOverStartExecutionButton();
        hanaClusterDetailsPage.notAuthorizedTooltipIsNotDisplayed();
      });
    });

    describe('Check Selection', () => {
      it('should forbid check selection saving', () => {
        hanaClusterDetailsPage.apiCreateUserWithoutAbilities();
        hanaClusterDetailsPage.loginWithoutAbilities();
        hanaClusterDetailsPage.visitAvailableHanaCluster();
        hanaClusterDetailsPage.clickCheckSelectionButton();
        hanaClusterDetailsPage.saveChecksSelectionButtonIsDisabled();
      });

      it('should allow check selection saving', () => {
        hanaClusterDetailsPage.apiCreateUserWithChecksSelectionAbility();
        hanaClusterDetailsPage.loginWithAbilities();
        hanaClusterDetailsPage.visitAvailableHanaCluster();
        hanaClusterDetailsPage.clickCheckSelectionButton();
        hanaClusterDetailsPage.saveChecksSelectionButtonIsDisplayed();
      });
    });
  });
});
