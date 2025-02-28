import * as hostDetailsPage from '../pageObject/host-details-po';

import { selectedHost } from '../fixtures/host-details/selected_host';
import {
  saptuneDetailsData,
  saptuneDetailsDataUnsupportedVersion,
} from '../fixtures/saptune-details/saptune_details_data';

import { createUserRequestFactory } from '@lib/test-utils/factories';

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

    it(`should show KVM cloud details correctly`, () => {
      hostDetailsPage.loadScenario('host-details-kvm');
      hostDetailsPage.expectedProviderIsDisplayed('kvm');
    });

    it(`should show vmware cloud details correctly`, () => {
      hostDetailsPage.loadScenario('host-details-vmware');
      hostDetailsPage.expectedProviderIsDisplayed('vmware');
    });

    it(`should show Nutanix cloud details correctly`, () => {
      hostDetailsPage.loadScenario('host-details-nutanix');
      hostDetailsPage.expectedProviderIsDisplayed('nutanix');
    });

    it(`should display provider not recognized message`, () => {
      hostDetailsPage.loadScenario('host-details-unknown');
      hostDetailsPage.notRecognizedProviderIsDisplayed();
    });
  });

  describe('SAP instances for this host should be displayed', () => {
    it(`should show SAP instance with ID ${selectedHost.sapInstance.id} data`, () => {
      cy.get('.container').eq(0).as('sapInstanceTable');
      cy.get('@sapInstanceTable')
        .find('tr')
        .eq(1)
        .find('td')
        .as('sapInstanceRow');

      cy.get('@sapInstanceTable')
        .contains('th', 'ID')
        .invoke('index')
        .then((i) => {
          cy.get('@sapInstanceRow')
            .eq(i)
            .should('contain', selectedHost.sapInstance.id);
        });

      cy.get('@sapInstanceTable')
        .contains('th', 'SID')
        .invoke('index')
        .then((i) => {
          cy.get('@sapInstanceRow')
            .eq(i)
            .should('contain', selectedHost.sapInstance.sid);
        });

      cy.get('@sapInstanceTable')
        .contains('th', 'Type')
        .invoke('index')
        .then((i) => {
          cy.get('@sapInstanceRow')
            .eq(i)
            .should('contain', selectedHost.sapInstance.type);
        });

      cy.get('@sapInstanceTable')
        .contains('th', 'Features')
        .invoke('index')
        .then((i) => {
          selectedHost.sapInstance.features.forEach((feature) => {
            cy.get('@sapInstanceRow').eq(i).should('contain', feature);
          });
        });

      cy.get('@sapInstanceTable')
        .contains('th', 'Instance Number')
        .invoke('index')
        .then((i) => {
          cy.get('@sapInstanceRow')
            .eq(i)
            .should('contain', selectedHost.sapInstance.instanceNumber);
        });
    });
  });

  describe('SLES subscriptions details for this host should be displayed', () => {
    it(`should show the SLES subscriptions details correctly`, () => {
      cy.get('.container').eq(1).as('slesSubscriptionsTable');
      selectedHost.slesSubscriptions.forEach((subscription, index) => {
        cy.get('@slesSubscriptionsTable')
          .find('tr')
          .eq(index + 1)
          .find('td')
          .as('slesSubscriptionsRow');

        cy.get('@slesSubscriptionsTable')
          .contains('th', 'Identifier')
          .invoke('index')
          .then((i) => {
            cy.get('@slesSubscriptionsRow')
              .eq(i)
              .should('contain', subscription.id);
          });

        cy.get('@slesSubscriptionsTable')
          .contains('th', 'Arch')
          .invoke('index')
          .then((i) => {
            cy.get('@slesSubscriptionsRow')
              .eq(i)
              .should('contain', subscription.arch);
          });

        cy.get('@slesSubscriptionsTable')
          .contains('th', 'version')
          .invoke('index')
          .then((i) => {
            cy.get('@slesSubscriptionsRow')
              .eq(i)
              .should('contain', subscription.version);
          });

        cy.get('@slesSubscriptionsTable')
          .contains('th', 'type')
          .invoke('index')
          .then((i) => {
            cy.get('@slesSubscriptionsRow')
              .eq(i)
              .should('contain', subscription.type);
          });

        cy.get('@slesSubscriptionsTable')
          .contains('th', 'Status')
          .invoke('index')
          .then((i) => {
            cy.get('@slesSubscriptionsRow')
              .eq(i)
              .should('contain', subscription.status);
          });

        cy.get('@slesSubscriptionsTable')
          .contains('th', 'Subscription status')
          .invoke('index')
          .then((i) => {
            cy.get('@slesSubscriptionsRow')
              .eq(i)
              .should('contain', subscription.subscriptionStatus);
          });

        cy.get('@slesSubscriptionsTable')
          .contains('th', 'starts_at')
          .invoke('index')
          .then((i) => {
            cy.get('@slesSubscriptionsRow')
              .eq(i)
              .should('contain', subscription.startsAt);
          });

        cy.get('@slesSubscriptionsTable')
          .contains('th', 'Expires at')
          .invoke('index')
          .then((i) => {
            cy.get('@slesSubscriptionsRow')
              .eq(i)
              .should('contain', subscription.expiresAt);
          });
      });
    });
  });

  describe("Trento agent status should be 'running'", () => {
    it("should show the status as 'running'", () => {
      cy.get('span').should('contain.text', 'Agent:running');
      cy.get('span').find('svg').should('exist');
    });
  });

  describe("Node exporter status should be 'running'", () => {
    it("should show the status as 'running'", () => {
      cy.get('span').should('contain.text', 'Node Exporter:running');
      cy.get('span').find('svg').should('exist');
    });
  });

  describe('Saptune Summary for this host should be displayed', () => {
    const { hostName } = selectedHost;
    const saptuneSummarySelector = '.pt-8';

    const scenarios = [
      {
        description: 'should show not installed status',
        name: 'saptune-uninstalled',
        data: {
          packageVersion: 'Not installed',
          configuredVersion: '-',
          tuningStatus: '-',
        },
      },
      {
        description: 'should show version is not supported status',
        name: 'saptune-unsupported',
        data: saptuneDetailsDataUnsupportedVersion,
      },
      {
        description:
          'should show package version, configured version and tuning status',
        name: 'saptune-compliant',
        data: saptuneDetailsData,
      },
    ];

    scenarios.forEach(({ data, description, name }) => {
      it(description, () => {
        const { configuredVersion, packageVersion, tuningStatus } = data;
        cy.loadScenario(`host-${hostName}-${name}`);
        cy.get(saptuneSummarySelector).should('contain', 'Saptune Summary');

        cy.get(saptuneSummarySelector)
          .contains('Package')
          .next()
          .should('contain', packageVersion);

        cy.get(saptuneSummarySelector)
          .contains('Configured Version')
          .next()
          .should('contain', configuredVersion);

        cy.get(saptuneSummarySelector)
          .contains('Tuning')
          .next()
          .should('contain', tuningStatus);
      });
    });
  });

  describe('Deregistration', () => {
    describe('"Clean up" button should be visible only for an unhealthy host', () => {
      it('should not display the "Clean up" button for healthy host', () => {
        cy.contains('button', 'Clean up').should('not.exist');
      });

      it('should show the "Clean up" button once heartbeat is lost and debounce period has elapsed', () => {
        cy.task('stopAgentsHeartbeat');
        cy.contains(`The host ${selectedHost.hostName} heartbeat is failing.`, {
          timeout: 15000,
        });
        cy.contains('button', 'Clean up', { timeout: 15000 }).should('exist');
      });
    });

    describe('"Clean up" button should deregister a host', () => {
      before(() => {
        cy.task('stopAgentsHeartbeat');
      });

      it('should allow to deregister a host after clean-up confirmation', () => {
        cy.contains('button', 'Clean up', { timeout: 15000 }).click();

        cy.get('#headlessui-portal-root').as('modal');

        cy.get('@modal')
          .find('.w-full')
          .should(
            'contain.text',
            `Clean up data discovered by agent on host ${selectedHost.hostName}`
          );
        cy.get('@modal').contains('button', 'Clean up').click();

        cy.get('@modal').should('not.exist');
        cy.url().should('eq', cy.config().baseUrl + '/hosts');
        cy.get(`#host-${selectedHost.agentId}`).should('not.exist');
      });
    });
  });

  describe('Forbidden actions', () => {
    const password = 'password';

    before(() => {
      cy.loadScenario(`host-details-${selectedHost.hostName}`);
    });

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
      it('should forbid check execution when the correct user abilities are not present in both settings and details', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, []);
          cy.login(user.username, password);
        });
        cy.visit(`/hosts/${selectedHost.agentId}/settings`);

        cy.contains('button', 'Start Execution').should('be.disabled');

        cy.contains('button', 'Start Execution').click({ force: true });

        cy.contains('span', 'You are not authorized for this action').should(
          'be.visible'
        );
        cy.visit(`/hosts/${selectedHost.agentId}`);

        cy.contains('button', 'Start Execution').should('be.disabled');

        cy.contains('button', 'Start Execution').click({ force: true });

        cy.contains('span', 'You are not authorized for this action').should(
          'be.visible'
        );
      });

      it('should enable check execution button when the correct user abilities are present', () => {
        cy.get('@user').then((user) => {
          cy.createUserWithAbilities(user, [
            { name: 'all', resource: 'host_checks_execution' },
          ]);
          cy.login(user.username, password);
        });

        cy.visit(`/hosts/${selectedHost.agentId}/settings`);

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
