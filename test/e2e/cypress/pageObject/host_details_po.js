export * from './base_po';
import * as basePage from './base_po';

import { capitalize } from 'lodash';

// Test Data
import { selectedHost } from '../fixtures/host-details/selected_host.js';
import {
  saptuneDetailsData,
  saptuneDetailsDataUnsupportedVersion,
} from '../fixtures/saptune-details/saptune_details_data.js';

const url = '/hosts';

// Selectors
const hostsNavigationItem = '.tn-menu-item[href="/hosts"]';

const clusterNameLabel = 'div:contains("Cluster") div span a span';
const agentVersionLabel =
  'div[class*="flow-row"]:contains("Agent Version") span';
const ipAddressesLabel = 'div[class*="flow-row"]:contains("IP Addresses") span';
const agentRunningLabel = 'span:contains("Agent:running")';
const agentRunningBadge = `${agentRunningLabel} svg`;
const nodeExporterLabel = 'span:contains("Node Exporter:running")';
const nodeExporterBadge = `${nodeExporterLabel} svg`;
const providerDetailsBox = 'div[class="mt-16"]:contains("Provider details")';
const notRecognizedProviderLabel = 'div:contains("Provider not recognized")';
const saptuneSummaryLabel = 'div h1:contains("Saptune Summary")';
const saptuneInstallationStatus =
  'div[class="font-bold"]:contains("Package") + div span span';
const saptuneConfiguredVersion =
  'div:contains("Configured Version") + div span';
const saptuneTuningLabel = 'div:contains("Tuning") + div span span';
const cleanUpUnhealthyHostButton = 'button:contains("Clean up")';
const cleanUpModal = '#headlessui-portal-root';
const cleanUpModalConfirmationButton = `${cleanUpModal} ${cleanUpUnhealthyHostButton}`;
const cleanUpModalTitle = `${cleanUpModal} h2:contains("Clean up data discovered by agent on host ${selectedHost.hostName}")`;
const heartbeatFailingToaster = `p:contains("The host ${selectedHost.hostName} heartbeat is failing.")`;
const cleanedUpHost = `#host-${selectedHost.agentId}`;
const startExecutionButton = 'button:contains("Start Execution")';
const notAuthorizedMessage =
  'span:contains("You are not authorized for this action")';
const saveChecksSelectionButton = 'button:contains("Save Checks Selection")';

const providerDetails = {
  provider: `${providerDetailsBox} div[class*="flow-row"]:contains("Provider") span`,
  vmName: `${providerDetailsBox} div[class*="flow-row"]:contains("VM Name") span`,
  resourceGroup: `${providerDetailsBox} div[class*="flow-row"]:contains("Resource group") span`,
  location: `${providerDetailsBox} div[class*="flow-row"]:contains("Location") span`,
  vmSize: `${providerDetailsBox} div[class*="flow-row"]:contains("VM Size") span`,
  dataDiskNumber: `${providerDetailsBox} div[class*="flow-row"]:contains("Data disk number") span`,
  offer: `${providerDetailsBox} div[class*="flow-row"]:contains("Offer") span`,
  sku: `${providerDetailsBox} div[class*="flow-row"]:contains("SKU") span`,
  region: `${providerDetailsBox} div[class*="flow-row"]:contains("Region") span`,
  instanceType: `${providerDetailsBox} div[class*="flow-row"]:contains("Instance type") span`,
  instanceId: `${providerDetailsBox} div[class*="flow-row"]:contains("Instance ID") span`,
  accountId: `${providerDetailsBox} div[class*="flow-row"]:contains("Account ID") span`,
  amiId: `${providerDetailsBox} div[class*="flow-row"]:contains("AMI ID") span`,
  vpcId: `${providerDetailsBox} div[class*="flow-row"]:contains("VPC ID") span`,
  instanceName: `${providerDetailsBox} div[class*="flow-row"]:contains("Instance name") span`,
  projectId: `${providerDetailsBox} div[class*="flow-row"]:contains("Project ID") span`,
  zone: `${providerDetailsBox} div[class*="flow-row"]:contains("Zone") span`,
  machineType: `${providerDetailsBox} div[class*="flow-row"]:contains("Machine type") span`,
  diskNumber: `${providerDetailsBox} div[class*="flow-row"]:contains("Disk number") span`,
  image: `${providerDetailsBox} div[class*="flow-row"]:contains("Image") span`,
  network: `${providerDetailsBox} div[class*="flow-row"]:contains("Network") span`,
};

// UI Interactions
export const visit = (selectedHost = '') =>
  basePage.visit(`/${url}/${selectedHost}`);

export const visitSelectedHost = () => visit(selectedHost.agentId);

export const visitHostSettings = () =>
  visit(`${selectedHost.agentId}/settings`);

export const clickSelectedHost = () =>
  cy.get(`#host-${selectedHost.agentId}`).click();

export const clickClusterNameLabel = () => cy.get(clusterNameLabel).click();

export const clickCleanUpUnhealthyHostButton = () =>
  cy.get(cleanUpUnhealthyHostButton, { timeout: 15000 }).click();

export const clickCleanUpConfirmationButton = () =>
  cy.get(cleanUpModalConfirmationButton).click();

//Validations
export const validateSelectedHostUrl = () =>
  basePage.validateUrl(`${url}/${selectedHost.agentId}`);

export const clusterNameHasExpectedValue = () =>
  cy.get(clusterNameLabel).should('have.text', selectedHost.clusterName);

export const agentVersionHasExpectedValue = () =>
  cy.get(agentVersionLabel).should('have.text', selectedHost.agentVersion);

export const ipAddressesHasExpectedValue = () =>
  cy.get(ipAddressesLabel).should('have.text', selectedHost.ipAddresses);

export const hostNavigationItemIsHighlighted = () =>
  cy
    .get(hostsNavigationItem)
    .invoke('attr', 'aria-current')
    .should('eq', 'page');

const _checkText = (selector, expectedText) => {
  cy.get(selector).should('have.text', expectedText);
};

export const expectedProviderIsDisplayed = (cloudProvider) => {
  const provider = selectedHost[`${cloudProvider}CloudDetails`].provider;
  const expectedProvider =
    cloudProvider === 'kvm' ? `On-premises / ${provider}` : provider;
  _checkText(providerDetails.provider, expectedProvider);
};

export const expectedVmNameIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.vmName,
    selectedHost[`${cloudProvider}CloudDetails`].vmName
  );
};

export const expectedResourceGroupIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.resourceGroup,
    selectedHost[`${cloudProvider}CloudDetails`].resourceGroup
  );
};

export const expectedLocationIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.location,
    selectedHost[`${cloudProvider}CloudDetails`].location
  );
};

export const expectedVmSizeIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.vmSize,
    selectedHost[`${cloudProvider}CloudDetails`].vmSize
  );
};

export const expectedDataDiskNumberIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.dataDiskNumber,
    selectedHost[`${cloudProvider}CloudDetails`].dataDiskNumber
  );
};

export const expectedOfferIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.offer,
    selectedHost[`${cloudProvider}CloudDetails`].offer
  );
};

export const expectedSkuIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.sku,
    selectedHost[`${cloudProvider}CloudDetails`].sku
  );
};

export const expectedRegionIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.region,
    selectedHost[`${cloudProvider}CloudDetails`].region
  );
};

export const expectedInstanceTypeIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.instanceType,
    selectedHost[`${cloudProvider}CloudDetails`].instanceType
  );
};

export const expectedInstanceIdIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.instanceId,
    selectedHost[`${cloudProvider}CloudDetails`].instanceId
  );
};

export const expectedAccountIdIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.accountId,
    selectedHost[`${cloudProvider}CloudDetails`].accountId
  );
};

export const expectedAmiIdIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.amiId,
    selectedHost[`${cloudProvider}CloudDetails`].amiId
  );
};

export const expectedVpcIdIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.vpcId,
    selectedHost[`${cloudProvider}CloudDetails`].vpcId
  );
};

export const expectedInstanceNameIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.instanceName,
    selectedHost[`${cloudProvider}CloudDetails`].instanceName
  );
};

export const expectedProjectIdIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.projectId,
    selectedHost[`${cloudProvider}CloudDetails`].projectId
  );
};

export const expectedZoneIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.zone,
    selectedHost[`${cloudProvider}CloudDetails`].zone
  );
};

export const expectedMachineTypeIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.machineType,
    selectedHost[`${cloudProvider}CloudDetails`].machineType
  );
};

export const expectedDiskNumberIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.diskNumber,
    selectedHost[`${cloudProvider}CloudDetails`].diskNumber
  );
};

export const expectedImageIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.image,
    selectedHost[`${cloudProvider}CloudDetails`].image
  );
};

export const expectedNetworkIsDisplayed = (cloudProvider) => {
  _checkText(
    providerDetails.network,
    selectedHost[`${cloudProvider}CloudDetails`].network
  );
};

export const validateSaptuneStatus = (installationStatus) => {
  let installationData;
  if (installationStatus === 'uninstalled') {
    installationData = {
      packageVersion: 'Not installed',
      configuredVersion: '-',
      tuningStatus: '-',
    };
  } else if (installationStatus === 'unsupported') {
    installationData = saptuneDetailsDataUnsupportedVersion;
  } else if (installationStatus === 'compliant') {
    installationData = saptuneDetailsData;
  }
  const { packageVersion, configuredVersion, tuningStatus } = installationData;
  cy.get(saptuneSummaryLabel).should('be.visible');
  cy.get(saptuneInstallationStatus).should('have.text', packageVersion);
  cy.get(saptuneConfiguredVersion).then((configuredVersionElement) =>
    cy.wrap(configuredVersionElement).should('have.text', configuredVersion)
  );
  cy.get(saptuneTuningLabel).then((tuningElement) =>
    cy.wrap(tuningElement).should('have.text', tuningStatus)
  );
};

export const notRecognizedProviderIsDisplayed = () =>
  cy.get(notRecognizedProviderLabel).should('be.visible');

const _processAttributeName = (attributeHeaderName) => {
  const splittedAttribute = attributeHeaderName.toLowerCase().split(' ');
  if (splittedAttribute.length === 2)
    return splittedAttribute[0] + capitalize(splittedAttribute[1]);
  else if (attributeHeaderName === 'Identifier') return 'id';
  else return splittedAttribute;
};

const _getTableHeaders = (tableName) => {
  return cy
    .get(`div[class*="mt-"]:contains("${tableName}") th`)
    .then((headers) => {
      const headerTexts = [...headers].map((header) =>
        header.textContent.trim()
      );
      return cy.wrap(headerTexts);
    });
};

export const agentStatusIsCorrectlyDisplayed = () => {
  cy.get(agentRunningLabel).should('be.visible');
  cy.get(agentRunningBadge)
    .invoke('attr', 'class')
    .then((classAttr) => {
      expect(classAttr).to.contain('jungle-green');
    });
};

export const nodeExporterStatusIsCorrectlyDisplayed = () => {
  cy.get(nodeExporterLabel).should('be.visible');
  cy.get(nodeExporterBadge)
    .invoke('attr', 'class')
    .then((classAttr) => {
      expect(classAttr).to.contain('jungle-green');
    });
};

export const slesSubscriptionsTableDisplaysExpectedData = () =>
  _genericTableValidation('SLES subscription details', selectedHost);

export const sapSystemsTableDisplaysExpectedData = () =>
  _genericTableValidation('SAP instances', selectedHost);

export const heartbeatFailingToasterIsDisplayed = () =>
  cy.get(heartbeatFailingToaster, { timeout: 15000 }).should('be.visible');

export const cleanUpUnhealthyHostButtonIsDisplayed = () =>
  cy.get(cleanUpUnhealthyHostButton, { timeout: 15000 }).should('be.visible');

export const cleanUpUnhealthyHostButtonIsDisabled = () =>
  cy.get(cleanUpUnhealthyHostButton, { timeout: 15000 }).should('be.disabled');

export const cleanUpUnhealthyHostButtonIsEnabled = () =>
  cy.get(cleanUpUnhealthyHostButton, { timeout: 15000 }).should('be.enabled');

export const cleanUpUnhealthyHostButtonNotVisible = () =>
  cy.get(cleanUpUnhealthyHostButton).should('not.exist');

export const cleanUpModalTitleIsDisplayed = () =>
  cy.get(cleanUpModalTitle).should('be.visible');

export const cleanuUpModalIsNotDisplayed = () => {
  cy.get(cleanUpModal).should('not.exist');
};

export const cleanedUpHostIsNotDisplayed = () => {
  cy.get(cleanedUpHost).should('not.exist');
};

export const startExecutionButtonIsDisabled = () =>
  cy.get(startExecutionButton).should('be.disabled');

export const notAuthorizedMessageIsNotDisplayed = () => {
  cy.get(startExecutionButton).trigger('mouseover', {
    force: true,
  });
  cy.get(notAuthorizedMessage).should('not.exist');
};

export const notAuthorizedMessageIsDisplayed = () => {
  cy.get(startExecutionButton).click({ force: true });
  cy.get(notAuthorizedMessage).should('be.visible');
};

export const saveChecksSelectionButtonIsDisabled = () =>
  cy.get(saveChecksSelectionButton).should('be.disabled');

export const saveChecksSelectionButtonIsEnabled = () =>
  cy.get(saveChecksSelectionButton).should('be.enabled');

const _getExpectedValuesObjectName = (tableName) => {
  if (tableName === 'SAP instances') return 'sapInstance';
  else if (tableName === 'SLES subscription details')
    return 'slesSubscriptions';
};

const _getArrayOfExpectedValues = (tableName, expectationsObject) => {
  const expectedValuesObjectName = _getExpectedValuesObjectName(tableName);
  const expectedValuesObject = expectationsObject[expectedValuesObjectName];
  if (
    Array.isArray(expectedValuesObject) === false &&
    typeof expectedValuesObject === 'object'
  )
    return [expectedValuesObject];
  else return expectedValuesObject;
};

const _genericTableValidation = (tableName, expectationsObject) => {
  const expectedValuesArray = _getArrayOfExpectedValues(
    tableName,
    expectationsObject
  );
  expectedValuesArray.forEach((rowExpectedValues, rowIndex) => {
    _getTableHeaders(tableName).then((headers) => {
      headers.forEach((header) => {
        const attributeName = _processAttributeName(header);
        let expectedValue = rowExpectedValues[attributeName];
        _validateCell(tableName, header, rowIndex, expectedValue);
      });
    });
  });
};

const _validateCell = (tableName, header, rowIndex, expectedValue) => {
  const tableHeaderSelector = `div[class*="mt-"]:contains("${tableName}") th:contains("${header}")`;
  const tableRowSelector = `div[class*="mt-"]:contains("${tableName}") tbody tr`;

  cy.get(tableHeaderSelector)
    .invoke('index')
    .then((i) => {
      const isPropertyArray = Array.isArray(expectedValue);
      if (isPropertyArray) {
        cy.wrap(expectedValue).each((value) => {
          cy.get(tableRowSelector)
            .eq(rowIndex)
            .find('td')
            .eq(i)
            .should('contain', value);
        });
      } else {
        cy.get(tableRowSelector)
          .eq(rowIndex)
          .find('td')
          .eq(i)
          .should('have.text', expectedValue);
      }
    });
};

// API
export const loadSaptuneScenario = (state) => {
  const { hostName } = selectedHost;
  basePage.loadScenario(`host-${hostName}-saptune-${state}`);
};

export const loadAwsHostDetails = () =>
  basePage.loadScenario('host-details-aws');
export const startAgentHeartbeat = () =>
  cy.task('startAgentHeartbeat', [selectedHost.agentId]);

export const restoreHost = () =>
  basePage.loadScenario(`host-details-${selectedHost.hostName}`);

export const stopAgentsHeartbeat = () => cy.task('stopAgentsHeartbeat');

export const apiCreateUserWithHostChecksExecutionAbilities = () =>
  basePage.createUserWithAbilities([
    {
      name: 'all',
      resource: 'host_checks_execution',
    },
  ]);

export const apiCreateUserWithChecksSelectionAbilities = () =>
  basePage.createUserWithAbilities([
    {
      name: 'all',
      resource: 'host_checks_selection',
    },
  ]);

export const apiCreateUserWithHostCleanupAbilities = () =>
  basePage.createUserWithAbilities([
    {
      name: 'cleanup',
      resource: 'host',
    },
  ]);
