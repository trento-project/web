import * as hanaClusterDetailsPage from '../pageObject/hana_cluster_details_po';

context('HANA cluster details', () => {
  before(() => hanaClusterDetailsPage.preloadTestData());

  describe('HANA cluster details should be consistent with the state of the cluster', () => {
    beforeEach(() => {
      hanaClusterDetailsPage.interceptCatalogRequest();
      hanaClusterDetailsPage.interceptLastExecutionRequest();
      hanaClusterDetailsPage.visitAvailableHanaCluster();
      hanaClusterDetailsPage.waitForInitialEndpoints();
    });

    it('should have expected cluster name in header', () => {
      hanaClusterDetailsPage.expectedClusterNameIsDisplayedInHeader();
    });

    it('should have expected provider', () => {
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

    it('should have a working link to the passing checks in the overview component', () => {
      hanaClusterDetailsPage.clickPassingChecksButton();
      hanaClusterDetailsPage.passingChecksUrlIsTheExpected();
    });

    it('should have the check overview component with warning checks', () => {
      hanaClusterDetailsPage.expectedWarningChecksCountIsDisplayed();
    });

    it('should have a working link to the warning checks in the overview component', () => {
      hanaClusterDetailsPage.clickWarningChecksButton();
      hanaClusterDetailsPage.warningChecksUrlIsTheExpected();
    });

    it('should have the check overview component with critical checks', () => {
      hanaClusterDetailsPage.expectedCriticalChecksCountIsDisplayed();
    });

    it('should have a working link to the critical checks in the overview component', () => {
      hanaClusterDetailsPage.clickCriticalChecksButton();
      hanaClusterDetailsPage.criticalChecksUrlIsTheExpected();
    });
  });

  describe('Cluster sites should have the expected hosts', () => {
    beforeEach(() => {
      hanaClusterDetailsPage.interceptCatalogRequest();
      hanaClusterDetailsPage.interceptLastExecutionRequest();
      hanaClusterDetailsPage.visitAvailableHanaCluster();
      hanaClusterDetailsPage.waitForInitialEndpoints();
      hanaClusterDetailsPage.validateAvailableHanaClusterUrl();
    });

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
    beforeEach(() => {
      hanaClusterDetailsPage.interceptCatalogRequest();
      hanaClusterDetailsPage.interceptLastExecutionRequest();
      hanaClusterDetailsPage.visitAvailableHanaCluster();
      hanaClusterDetailsPage.waitForInitialEndpoints();
    });

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

    after(() => {
      hanaClusterDetailsPage.deregisterHanaClusterCostOptHosts();
    });

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

    after(() => {
      hanaClusterDetailsPage.deregisterAngiClusterCostOptHosts();
    });

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

  describe('Check Selection should allow to enable checks from the checks catalog', () => {
    const CHECK_COROSYNC = 'Corosync';
    const CHECK_MISCELLANEOUS = 'Miscellaneous';
    const CHECK_OS_AND_PACKAGE_VERSIONS = 'OS and package versions';
    const CHECK_PACEMAKER = 'Pacemaker';
    const CHECK_SBD = 'SBD';

    beforeEach(() => hanaClusterDetailsPage.visitAvailableHanaCluster());

    it('should include the checks catalog in the checks results once enabled', () => {
      hanaClusterDetailsPage.clickCheckSelectionButton();
      hanaClusterDetailsPage.expectedCheckIsDisplayed(CHECK_COROSYNC);
      hanaClusterDetailsPage.expectedCheckIsDisplayed(CHECK_MISCELLANEOUS);
      hanaClusterDetailsPage.expectedCheckIsDisplayed(
        CHECK_OS_AND_PACKAGE_VERSIONS
      );
      hanaClusterDetailsPage.expectedCheckIsDisplayed(CHECK_PACEMAKER);
      hanaClusterDetailsPage.expectedCheckIsDisplayed(CHECK_SBD);

      hanaClusterDetailsPage.clickAllUncheckedCategorySwitches();
      hanaClusterDetailsPage.clickSaveChecksSelectionButton();
      hanaClusterDetailsPage.clickStartExecutionButtonWithoutForce();
      hanaClusterDetailsPage.expectedResultRowsAreDisplayed(51);
    });
  });

  describe('Cluster with unknown provider', () => {
    before(() => {
      hanaClusterDetailsPage.loadScenario('cluster-unknown-provider');
      hanaClusterDetailsPage.visitAvailableHanaCluster();
    });

    it('should show a warning message in the check selection view', () => {
      hanaClusterDetailsPage.clickCheckSelectionButton();
      const expectedWarningMessage =
        'The following catalog is valid for on-premise bare metal platforms.If you are running your HANA cluster on a different platform, please use results with caution';
      hanaClusterDetailsPage.expectedWarningMessageIsDisplayed(
        expectedWarningMessage
      );
    });

    it(`should show a warning message in the checks results view`, () => {
      hanaClusterDetailsPage.visitAvailableHanaCluster();
      hanaClusterDetailsPage.clickCheckResultsButton();
      const expectedWarningMessage =
        'The following results are valid for on-premise bare metal platforms.If you are running your HANA cluster on a different platform, please use results with caution';
      hanaClusterDetailsPage.expectedWarningMessageIsDisplayed(
        expectedWarningMessage
      );
    });
  });

  describe('Cluster with kvm provider', () => {
    before(() => {
      hanaClusterDetailsPage.loadScenario('cluster-kvm-provider');
      hanaClusterDetailsPage.visitAvailableHanaCluster();
    });

    it('should show the default check catalog with corosync token timeout default value', () => {
      hanaClusterDetailsPage.clickCheckSelectionButton();
      hanaClusterDetailsPage.clickCorosyncCheckCategory();
      hanaClusterDetailsPage.clickCorosyncTokenTimeoutCheckSettings();
      hanaClusterDetailsPage.checkInputValueIsTheExpected(5000);
    });
  });

  describe('Cluster with vmware provider', () => {
    beforeEach(() => {
      hanaClusterDetailsPage.loadScenario('cluster-vmware-provider');
      hanaClusterDetailsPage.visitAvailableHanaCluster();
    });

    it('should recognize the provider as vmware', () => {
      hanaClusterDetailsPage.clickCheckSelectionButton();
      hanaClusterDetailsPage.expectedProviderIsDisplayed('VMware');
    });
  });

  describe('Cluster with nutanix provider', () => {
    before(() => {
      hanaClusterDetailsPage.loadScenario('cluster-nutanix-provider');
      hanaClusterDetailsPage.visitAvailableHanaCluster();
    });

    it('should show the default check catalog with corosync token timeout default value', () => {
      hanaClusterDetailsPage.clickCheckSelectionButton();
      hanaClusterDetailsPage.clickCorosyncCheckCategory();
      hanaClusterDetailsPage.clickCorosyncTokenTimeoutCheckSettings();
      hanaClusterDetailsPage.checkInputValueIsTheExpected(5000);
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
        hanaClusterDetailsPage.apiCreateUserWithChecksExecutionAbility();
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
