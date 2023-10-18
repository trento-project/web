import { selectedHost } from '../fixtures/host-details/selected_host';
import {
  saptuneDetailsData,
  saptuneDetailsDataUnsupportedVersion,
} from '../fixtures/saptune-details/saptune_details_data';

context('Host Details', () => {
  before(() => {
    cy.task('startAgentHeartbeat', [selectedHost.agentId]);
    cy.visit('/hosts');

    cy.get(`#host-${selectedHost.agentId} > a`).click();
    cy.url().should('include', `/hosts/${selectedHost.agentId}`);
  });

  after(() => {
    cy.task('stopAgentsHeartbeat');
  });

  describe('Detailed view for a specific host should be available', () => {
    it('should highlight the hosts sidebar entry', () => {
      cy.get('.tn-menu-item[href="/hosts"]')
        .invoke('attr', 'aria-current')
        .should('eq', 'page');
    });

    it('should show the correct cluster', () => {
      cy.get('div')
        .contains(/Cluster$/)
        .next()
        .should('contain', selectedHost.clusterName);
    });

    it('should show the correct agent version', () => {
      cy.get('div')
        .contains(/Agent Version$/)
        .next()
        .should('contain', selectedHost.agentVersion);
    });

    it('should show the correct IP addresses', () => {
      cy.get('div')
        .contains(/IP addresses$/)
        .next()
        .should('contain', selectedHost.ipAddresses);
    });
  });

  describe('Cluster details for this host should be displayed', () => {
    it(`should show a link to the cluster details view for ${selectedHost.clusterName}`, () => {
      cy.get('.text-jungle-green-500 > .truncate')
        .should('contain', selectedHost.clusterName)
        .click();

      cy.location('pathname').should(
        'eq',
        `/clusters/${selectedHost.clusterId}`
      );
      cy.go('back');
    });
  });

  describe('Cloud details for this host should be displayed', () => {
    // Restore host provider data
    after(() => {
      cy.loadScenario('host-details-azure');
    });

    it(`should show Azure cloud details correctly`, () => {
      cy.get('div')
        .contains(/^Provider$/)
        .next()
        .should('contain', selectedHost.azureCloudDetails.provider);
      cy.get('div')
        .contains('VM Name')
        .next()
        .should('contain', selectedHost.azureCloudDetails.vmName);
      cy.get('div')
        .contains('Resource group')
        .next()
        .should('contain', selectedHost.azureCloudDetails.resourceGroup);
      cy.get('div')
        .contains('Location')
        .next()
        .should('contain', selectedHost.azureCloudDetails.location);
      cy.get('div')
        .contains('VM Size')
        .next()
        .should('contain', selectedHost.azureCloudDetails.vmSize);
      cy.get('div')
        .contains('Data disk number')
        .next()
        .should('contain', selectedHost.azureCloudDetails.dataDiskNumber);
      cy.get('div')
        .contains('Offer')
        .next()
        .should('contain', selectedHost.azureCloudDetails.offer);
      cy.get('div')
        .contains('SKU')
        .next()
        .should('contain', selectedHost.azureCloudDetails.sku);
    });

    it(`should show AWS cloud details correctly`, () => {
      cy.loadScenario('host-details-aws');

      cy.get('div').should('contain', selectedHost.awsCloudDetails.provider);

      cy.get('div')
        .contains(/^Provider$/)
        .next()
        .should('contain', selectedHost.awsCloudDetails.provider);
      cy.get('div')
        .contains('Instance ID')
        .next()
        .should('contain', selectedHost.awsCloudDetails.instanceId);
      cy.get('div')
        .contains('Account ID')
        .next()
        .should('contain', selectedHost.awsCloudDetails.accountId);
      cy.get('div')
        .contains('Region')
        .next()
        .should('contain', selectedHost.awsCloudDetails.region);
      cy.get('div')
        .contains('Instance type')
        .next()
        .should('contain', selectedHost.awsCloudDetails.instanceType);
      cy.get('div')
        .contains('Data disk number')
        .next()
        .should('contain', selectedHost.awsCloudDetails.dataDiskNumber);
      cy.get('div')
        .contains('AMI ID')
        .next()
        .should('contain', selectedHost.awsCloudDetails.amiId);
      cy.get('div')
        .contains('VPC ID')
        .next()
        .should('contain', selectedHost.awsCloudDetails.vpcId);
    });

    it(`should show GCP cloud details correctly`, () => {
      cy.loadScenario('host-details-gcp');

      cy.get('div').should('contain', selectedHost.gcpCloudDetails.provider);

      cy.get('div')
        .contains(/^Provider$/)
        .next()
        .should('contain', selectedHost.gcpCloudDetails.provider);
      cy.get('div')
        .contains('Instance name')
        .next()
        .should('contain', selectedHost.gcpCloudDetails.instanceName);
      cy.get('div')
        .contains('Project ID')
        .next()
        .should('contain', selectedHost.gcpCloudDetails.projectId);
      cy.get('div')
        .contains('Zone')
        .next()
        .should('contain', selectedHost.gcpCloudDetails.zone);
      cy.get('div')
        .contains('Machine type')
        .next()
        .should('contain', selectedHost.gcpCloudDetails.machineType);
      cy.get('div')
        .contains('Disk number')
        .next()
        .should('contain', selectedHost.gcpCloudDetails.diskNumber);
      cy.get('div')
        .contains('Image')
        .next()
        .should('contain', selectedHost.gcpCloudDetails.image);
      cy.get('div')
        .contains('Network')
        .next()
        .should('contain', selectedHost.gcpCloudDetails.network);
    });

    it(`should show KVM cloud details correctly`, () => {
      cy.loadScenario('host-details-kvm');

      cy.get('div')
        .contains(/^Provider$/)
        .next()
        .should('contain', selectedHost.kvmCloudDetails.provider);
    });

    it(`should show vmware cloud details correctly`, () => {
      cy.loadScenario('host-details-vmware');

      cy.get('div')
        .contains(/^Provider$/)
        .next()
        .should('contain', selectedHost.vmwareCloudDetails.provider);
    });

    it(`should show Nutanix cloud details correctly`, () => {
      cy.loadScenario('host-details-nutanix');

      cy.get('div')
        .contains(/^Provider$/)
        .next()
        .should('contain', selectedHost.nutanixCloudDetails.provider);
    });

    it(`should display provider not recognized message`, () => {
      cy.loadScenario('host-details-unknown');

      cy.get('div').should('contain', 'Provider not recognized');
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
});
