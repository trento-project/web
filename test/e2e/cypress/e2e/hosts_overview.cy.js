import * as hostsOverviewPage from '../pageObject/hosts_overview_po';

context('Hosts Overview', () => {
  before(() => hostsOverviewPage.preloadTestData());

  beforeEach(() => hostsOverviewPage.visit());

  it('should have expected url', () => {
    hostsOverviewPage.validateUrl();
  });

  describe('Registered Hosts are shown in the list', () => {
    it('should highlight the hosts sidebar entry', () => {
      hostsOverviewPage.hostsIsHighglightedInSidebar();
    });

    it('should show 10 of the 27 registered hosts', () => {
      hostsOverviewPage.tenHostsAreListed();
    });

    it('should have 3 pages', () => {
      hostsOverviewPage.expectedPaginationIsDisplayed('Showing 1–10 of 27');
      hostsOverviewPage.clickNextPageButton();
      hostsOverviewPage.expectedPaginationIsDisplayed('Showing 11–20 of 27');
      hostsOverviewPage.clickNextPageButton();
      hostsOverviewPage.expectedPaginationIsDisplayed('Showing 21–27 of 27');
      hostsOverviewPage.nextPageButtonIsDisabled();
    });

    it('should show the ip addresses, provider and agent version data for the hosts in the 1st page', () => {
      hostsOverviewPage.hostsTableContentsAreTheExpected();
    });

    it('should link to the correct host details page clicking in the host name', () => {
      hostsOverviewPage.everyLinkGoesToExpectedHostDetailsPage();
    });

    it('should link to the correct cluster details page clicking in the cluster name', () => {
      hostsOverviewPage.everyClusterLinkGoesToExpectedClusterDetailsPage();
    });

    it('should link to the correct sap system details page clicking in the sap system name', () => {
      hostsOverviewPage.everySapSystemLinkGoesToExpectedSapSystemDetailsPage();
    });
  });

  describe('Health Detection', () => {
    describe('Health Container shows the health overview of the deployed landscape', () => {
      before(() => {
        hostsOverviewPage.startAgentsHeartbeat();
      });

      it('should show health status of the entire cluster of 27 hosts with partial pagination', () => {
        hostsOverviewPage.expectedPassingHostsAreDisplayed(11);
        hostsOverviewPage.expectedWarningHostsAreDisplayed(12);
        hostsOverviewPage.expectedCriticalHostsAreDisplayed(4);
      });

      it('should show the correct health on the hosts when the agents are sending the heartbeat', () => {
        hostsOverviewPage.expectedAmountOfPassingIsDisplayed(8);
        hostsOverviewPage.expectedAmountOfWarningsIsDisplayed(2);
      });

      after(() => hostsOverviewPage.stopAgentsHeartbeat());
    });

    describe('Health is changed based on saptune status', () => {
      before(() => hostsOverviewPage.startAgentsHeartbeat());

      it('should not change the health if saptune is not installed and a SAP workload is not running', () => {
        hostsOverviewPage.loadHostWithoutSaptune();
        hostsOverviewPage.hostWithSapHasExpectedStatus();
      });

      it('should not change the health if saptune is installed and a SAP workload is not running', () => {
        hostsOverviewPage.loadHostWithSaptuneNotTuned();
        hostsOverviewPage.hostWithSapHasExpectedStatus();
      });

      it('should change the health to warning if saptune is not installed', () => {
        hostsOverviewPage.loadHostWithSapWithoutSaptune();
        hostsOverviewPage.hostWithoutSapHasExpectedStatus();
      });

      it('should change the health to warning if saptune version is unsupported', () => {
        hostsOverviewPage.loadHostWithSapWithSaptuneUnsupported();
        hostsOverviewPage.hostWithoutSapHasExpectedStatus();
      });

      it('should change health to not compliant when saptune is not compliant', () => {
        hostsOverviewPage.loadHostWithSaptuneScenario('not-compliant');
        hostsOverviewPage.hostWithSaptuneNotCompliantHasExpectedStatus();
      });

      it('should change health to not tuned when saptune is not tuned', () => {
        hostsOverviewPage.loadHostWithSaptuneScenario('not-tuned');
        hostsOverviewPage.hostWithSaptuneNotTunedHasExpectedStatus();
      });

      it('should change health to compliant when saptune is compliant', () => {
        hostsOverviewPage.loadHostWithSaptuneScenario('compliant');
        hostsOverviewPage.hostWithSaptuneCompliantHasExpectedStatus();
      });

      after(() => hostsOverviewPage.stopAgentsHeartbeat());
    });

    describe('Health is changed to critical when the heartbeat is not sent', () => {
      beforeEach(() => hostsOverviewPage.startAgentsHeartbeat());

      it('should show health status of the entire cluster of 27 hosts with critical health', () => {
        hostsOverviewPage.expectedCriticalHostsAreDisplayed(4);
        hostsOverviewPage.stopAgentsHeartbeat();
        hostsOverviewPage.expectedCriticalHostsAreDisplayed(27);
      });

      it('should show a critical health on the hosts when the agents are not sending the heartbeat', () => {
        hostsOverviewPage.expectedAmountOfCriticalsIsDisplayed(0);
        hostsOverviewPage.stopAgentsHeartbeat();
        hostsOverviewPage.expectedAmountOfCriticalsIsDisplayed(10);
      });

      afterEach(() => hostsOverviewPage.stopAgentsHeartbeat());
    });
  });

  describe('Deregistration', () => {
    describe('Clean-up buttons should be visible only when needed', () => {
      it('should not display a clean-up button when heartbeat is sent', () => {
        hostsOverviewPage.cleanupButtonIsDisplayedForHostSendingHeartbeat();
        hostsOverviewPage.startAgentHeartbeat();
        hostsOverviewPage.cleanupButtonIsNotDisplayedForHostSendingHeartbeat();
      });

      it('should show all other cleanup buttons', () => {
        hostsOverviewPage.expectedAmountOfCleanupButtonsIsDisplayed(10);
        hostsOverviewPage.startAgentHeartbeat();
        hostsOverviewPage.expectedAmountOfCleanupButtonsIsDisplayed(9);
      });

      afterEach(() => hostsOverviewPage.stopAgentsHeartbeat());
    });

    describe('Clean-up button should deregister a host', () => {
      beforeEach(() => {
        hostsOverviewPage.apiRestoreCleanedUpHost();
        hostsOverviewPage.apiDeleteAllHostsTags();
        hostsOverviewPage.addTagToHost();
        hostsOverviewPage.startAgentHeartbeat();
        hostsOverviewPage.stopAgentsHeartbeat();
        hostsOverviewPage.heartbeatFailingToasterIsDisplayed();
      });

      it('should allow to deregister a host after clean up confirmation & restore it', () => {
        hostsOverviewPage.clickCleanupOnHostToDeregister();
        hostsOverviewPage.deregisterModalTitleIsDisplayed();
        hostsOverviewPage.clickCleanupConfirmationButton();
        hostsOverviewPage.deregisteredHostIsNotVisible();
        hostsOverviewPage.apiRestoreCleanedUpHost();
        hostsOverviewPage.restoredHostIsDisplayed();
        hostsOverviewPage.tagOfRestoredHostIsDisplayed();
      });

      describe('Deregistration of hosts should update remaining hosts data', () => {
        beforeEach(() => hostsOverviewPage.restoreSapSystem());

        it('should remove the SAP system sid from hosts belonging the deregistered SAP system', () => {
          hostsOverviewPage.clickNextPageButton();
          hostsOverviewPage.sapSystemHasExpectedAmountOfHosts(4);
          hostsOverviewPage.apiDeregisterSapSystemHost();
          hostsOverviewPage.deregisteredSapSystemIsNotDisplayed();
        });
      });

      describe('Movement of application instances on hosts', () => {
        beforeEach(() => {
          hostsOverviewPage.loadSapSystemsOverviewMovedScenario();
          hostsOverviewPage.clickNextPageButton();
          hostsOverviewPage.sapSystemHasExpectedAmountOfHosts(3);
        });

        after(() => hostsOverviewPage.restoreSapSystem());

        it('should associate instances to the correct host during deregistration', () => {
          hostsOverviewPage.apiDeregisterMovedHost();
          hostsOverviewPage.deregisteredSapSystemIsNotDisplayed();
        });

        it('should complete host deregistration when all instances are moved out', () => {
          hostsOverviewPage.apiDeregisterMovedHost();
          hostsOverviewPage.initialHostNameIsDisplayed();
          hostsOverviewPage.apiDeregisterInitialHostId();
          hostsOverviewPage.initialHostNameIsNotDisplayed();
        });
      });
    });
  });

  describe('Forbidden actions', () => {
    beforeEach(() => {
      hostsOverviewPage.apiDeleteAllHostsTags();
      hostsOverviewPage.apiSetTag();
      hostsOverviewPage.apiDeleteAllUsers();
      hostsOverviewPage.logout();
    });

    describe('Tag creation', () => {
      it('it should prevent a tag update when the user abilities are not compliant', () => {
        hostsOverviewPage.apiCreateUserWithoutAbilities();
        hostsOverviewPage.loginWithoutAbilities();
        hostsOverviewPage.visit();
        hostsOverviewPage.addTagButtonIsDisabled();
        hostsOverviewPage.removeTag1ButtonIsDisabled();
      });

      it('it should allow a tag update when the user abilities are compliant', () => {
        hostsOverviewPage.apiCreateUserWithHostTagsAbility();
        hostsOverviewPage.loginWithAbilities();
        hostsOverviewPage.visit();
        hostsOverviewPage.addTagButtonIsEnabled();
        hostsOverviewPage.removeTag1ButtonIsEnabled();
      });
    });

    describe('Clean up', () => {
      it('should forbid host clean up', () => {
        hostsOverviewPage.apiCreateUserWithoutAbilities();
        hostsOverviewPage.loginWithoutAbilities();
        hostsOverviewPage.visit();
        hostsOverviewPage.cleanupButtonsAreDisabled();
      });

      it('should allow host clean up', () => {
        hostsOverviewPage.apiCreateUserWithHostCleanupAbility();
        hostsOverviewPage.loginWithAbilities();
        hostsOverviewPage.visit();
        hostsOverviewPage.cleanupButtonsAreEnabled();
      });
    });
  });
});
