import * as hostDetailsPage from '../pageObject/host-details-po';

import { selectedHost } from '../fixtures/host-details/selected_host';

context('Host Details', () => {
  before(() => {
    // hostDetailsPage.preloadTestData();
    hostDetailsPage.startAgentHeartbeat();
  });

  after(() => {
    hostDetailsPage.stopAgentsHeartbeat();
  });

  describe('Navigation to the selected host', () => {
    it('should navigate to the selected host', () => {
      hostDetailsPage.visit();
      hostDetailsPage.clickSelectedHost();
      hostDetailsPage.validateSelectedHostUrl();
    });
  });

  describe('Detailed view for a specific host should be available', () => {
    beforeEach(() => {
      hostDetailsPage.visitSelectedHost();
    });

    it('should highlight the hosts sidebar entry', () => {
      hostDetailsPage.hostNavigationItemIsHighlighted();
    });

    it('should show the correct cluster', () => {
      hostDetailsPage.clusterNameHasExpectedValue();
    });

    it('should show the correct agent version', () => {
      hostDetailsPage.agentVersionHasExpectedValue();
    });

    it('should show the correct IP addresses', () => {
      hostDetailsPage.ipAddressesHasExpectedValue();
    });
  });

  describe('Cluster details for this host should be displayed', () => {
    it(`should show a link to the cluster details view for ${selectedHost.clusterName}`, () => {
      hostDetailsPage.visitSelectedHost();
      hostDetailsPage.clickClusterNameLabel();
      hostDetailsPage.validateUrl(`/clusters/${selectedHost.clusterId}`);
    });
  });

  describe('Cloud details for this host should be displayed', () => {
    beforeEach(() => {
      hostDetailsPage.visitSelectedHost();
    });

    // Restore host provider data
    after(() => {
      cy.loadScenario('host-details-azure');
    });

    it('should show Azure cloud details correctly', () => {
      hostDetailsPage.expectedProviderIsDisplayed('azure');
      hostDetailsPage.expectedVmNameIsDisplayed('azure');
      hostDetailsPage.expectedResourceGroupIsDisplayed('azure');
      hostDetailsPage.expectedLocationIsDisplayed('azure');
      hostDetailsPage.expectedVmSizeIsDisplayed('azure');
      hostDetailsPage.expectedDataDiskNumberIsDisplayed('azure');
      hostDetailsPage.expectedOfferIsDisplayed('azure');
      hostDetailsPage.expectedSkuIsDisplayed('azure');
    });

    it('should show AWS cloud details correctly', () => {
      hostDetailsPage.loadScenario('host-details-aws');
      hostDetailsPage.expectedProviderIsDisplayed('aws');
      hostDetailsPage.expectedInstanceIdIsDisplayed('aws');
      hostDetailsPage.expectedAccountIdIsDisplayed('aws');
      hostDetailsPage.expectedRegionIsDisplayed('aws');
      hostDetailsPage.expectedInstanceTypeIsDisplayed('aws');
      hostDetailsPage.expectedDataDiskNumberIsDisplayed('aws');
      hostDetailsPage.expectedAmiIdIsDisplayed('aws');
      hostDetailsPage.expectedVpcIdIsDisplayed('aws');
    });

    it('should show GCP cloud details correctly', () => {
      hostDetailsPage.loadScenario('host-details-gcp');
      hostDetailsPage.expectedProviderIsDisplayed('gcp');
      hostDetailsPage.expectedInstanceNameIsDisplayed('gcp');
      hostDetailsPage.expectedProjectIdIsDisplayed('gcp');
      hostDetailsPage.expectedZoneIsDisplayed('gcp');
      hostDetailsPage.expectedMachineTypeIsDisplayed('gcp');
      hostDetailsPage.expectedDiskNumberIsDisplayed('gcp');
      hostDetailsPage.expectedImageIsDisplayed('gcp');
      hostDetailsPage.expectedNetworkIsDisplayed('gcp');
    });

    it('should show KVM cloud details correctly', () => {
      hostDetailsPage.loadScenario('host-details-kvm');
      hostDetailsPage.expectedProviderIsDisplayed('kvm');
    });

    it('should show vmware cloud details correctly', () => {
      hostDetailsPage.loadScenario('host-details-vmware');
      hostDetailsPage.expectedProviderIsDisplayed('vmware');
    });

    it('should show Nutanix cloud details correctly', () => {
      hostDetailsPage.loadScenario('host-details-nutanix');
      hostDetailsPage.expectedProviderIsDisplayed('nutanix');
    });

    it('should display provider not recognized message', () => {
      hostDetailsPage.loadScenario('host-details-unknown');
      hostDetailsPage.notRecognizedProviderIsDisplayed();
    });
  });

  describe('SAP instances for this host should be displayed', () => {
    beforeEach(() => {
      hostDetailsPage.visitSelectedHost();
    });

    it('should show SAP instance data', () => {
      hostDetailsPage.sapSystemsTableDisplaysExpectedData();
    });
  });

  describe('SLES subscriptions details for this host should be displayed', () => {
    beforeEach(() => hostDetailsPage.visitSelectedHost());

    it('should show the SLES subscriptions details correctly', () => {
      hostDetailsPage.slesSubscriptionsTableDisplaysExpectedData();
    });
  });

  describe("Trento agent status should be 'running'", () => {
    beforeEach(() => hostDetailsPage.visitSelectedHost());

    it("should show the status as 'running'", () => {
      hostDetailsPage.agentStatusIsCorrectlyDisplayed();
    });
  });

  describe("Node exporter status should be 'running'", () => {
    beforeEach(() => hostDetailsPage.visitSelectedHost());

    it("should show the status as 'running'", () => {
      hostDetailsPage.nodeExporterStatusIsCorrectlyDisplayed();
    });
  });

  describe('Saptune Summary for this host should be displayed', () => {
    beforeEach(() => hostDetailsPage.visitSelectedHost());

    it('should show not installed status', () => {
      hostDetailsPage.loadSaptuneScenario('uninstalled');
      hostDetailsPage.validateSaptuneStatus('uninstalled');
    });

    it('should show saptune unsupported status', () => {
      hostDetailsPage.loadSaptuneScenario('unsupported');
      hostDetailsPage.validateSaptuneStatus('unsupported');
    });

    it('should show saptune compliant status', () => {
      hostDetailsPage.loadSaptuneScenario('compliant');
      hostDetailsPage.validateSaptuneStatus('compliant');
    });
  });

  describe('Deregistration', () => {
    beforeEach(() => hostDetailsPage.visitSelectedHost());

    describe('"Clean up" button should be visible only for an unhealthy host', () => {
      it('should not display the "Clean up" button for healthy host', () => {
        hostDetailsPage.cleanUpUnhealthyHostButtonNotVisible();
      });

      it('should show the "Clean up" button once heartbeat is lost and debounce period has elapsed', () => {
        hostDetailsPage.stopAgentsHeartbeat();
        hostDetailsPage.heartbeatFailingToasterIsDisplayed();
        hostDetailsPage.cleanUpUnhealthyHostButtonIsDisplayed();
      });
    });

    describe('"Clean up" button should deregister a host', () => {
      before(() => hostDetailsPage.stopAgentsHeartbeat());

      it('should allow to deregister a host after clean-up confirmation', () => {
        hostDetailsPage.clickCleanUpUnhealthyHostButton();
        hostDetailsPage.cleanUpModalTitleIsDisplayed();
        hostDetailsPage.clickCleanUpConfirmationButton();
        hostDetailsPage.cleanuUpModalIsNotDisplayed();
        hostDetailsPage.validateUrl('/hosts');
        hostDetailsPage.cleanedUpHostIsNotDisplayed();
      });
    });
  });

  describe('Forbidden actions', () => {
    before(() => hostDetailsPage.restoreHost());

    beforeEach(() => {
      hostDetailsPage.apiDeleteAllUsers();
      hostDetailsPage.logout();
    });

    describe('Check Execution', () => {
      it('should forbid check execution when the correct user abilities are not present in both settings and details', () => {
        hostDetailsPage.apiCreateUserWithoutAbilities();
        hostDetailsPage.loginWithoutAbilities();

        hostDetailsPage.visitHostSettings();
        hostDetailsPage.startExecutionButtonIsDisabled();
        hostDetailsPage.notAuthorizedMessageIsDisplayed();

        hostDetailsPage.visitSelectedHost();
        hostDetailsPage.startExecutionButtonIsDisabled();
        hostDetailsPage.notAuthorizedMessageIsDisplayed();
      });

      it('should enable check execution button when the correct user abilities are present', () => {
        hostDetailsPage.apiCreateUserWithHostChecksExecutionAbilities();
        hostDetailsPage.loginWithAbilities();

        hostDetailsPage.visitHostSettings();
        hostDetailsPage.startExecutionButtonIsDisabled();
        hostDetailsPage.notAuthorizedMessageIsNotDisplayed();
      });
    });

    describe('Check Selection', () => {
      it('should forbid check selection saving', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });
        cy.visit(`/hosts/${selectedHost.agentId}/settings`);

        cy.contains('button', 'Save Checks Selection').should('be.disabled');
      });

      it('should allow check selection saving', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'all', resource: 'host_checks_selection' },
          ]);
          cy.login(user.username, password);
        });
        cy.visit(`/hosts/${selectedHost.agentId}/settings`);

        cy.contains('button', 'Save Checks Selection').should('be.enabled');
      });
    });

    describe('Clean up', () => {
      it('should forbid host clean up', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });
        cy.visit(`/hosts/${selectedHost.agentId}`);

        cy.contains('button', 'Clean up').should('be.disabled');
      });

      it('should allow host clean up', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'cleanup', resource: 'host' },
          ]);
          cy.login(user.username, password);
        });
        cy.visit(`/hosts/${selectedHost.agentId}`);

        cy.contains('button', 'Clean up').should('be.enabled');
      });
    });
  });
});
