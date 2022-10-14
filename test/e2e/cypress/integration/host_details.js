import { selectedHost } from '../fixtures/host-details/selected_host';

context('Host Details', () => {
  before(() => {
    cy.task('startAgentHeartbeat', [selectedHost.agentId]);

    cy.navigateToItem('Hosts');
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

    it('should show the host I clicked on in the overview', () => {
      cy.get('.grid-flow-col > :nth-child(1) > :nth-child(2) > span').should(
        'contain',
        selectedHost.hostName
      );
    });

    it('should show the correct agent version', () => {
      cy.get('.grid-flow-col > :nth-child(3) > :nth-child(2) > span').should(
        'contain',
        selectedHost.agentVersion
      );
    });
  });

  describe('Cluster details for this host should be displayed', () => {
    it(`should show a link to the cluster details view for ${selectedHost.clusterName}`, () => {
      cy.get('.text-jungle-green-500')
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
      cy.get('span').should('contain', 'Agent: running');
    });
  });

  describe("Node exporter status should be 'running'", () => {
    it("should show the status as 'running'", () => {
      cy.get('span').should('contain', 'Node Exporter: running');
    });
  });
});
