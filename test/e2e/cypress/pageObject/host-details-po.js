export * from './base-po.js';
import * as basePage from './base-po.js';

import { capitalize } from 'lodash';

// Test Data
import { selectedHost } from '../fixtures/host-details/selected_host';
import {
  saptuneDetailsData,
  saptuneDetailsDataUnsupportedVersion,
} from '../fixtures/saptune-details/saptune_details_data';

const url = '/hosts';

// Selectors
const hostsNavigationItem = '.tn-menu-item[href="/hosts"]';

const clusterNameLabel = 'div:contains("Cluster") div span a span';
const agentVersionLabel =
  'div[class*="flow-row"]:contains("Agent Version") span';
const ipAddressesLabel = 'div[class*="flow-row"]:contains("IP Addresses") span';

const providerDetailsBox = 'div[class="mt-16"]:contains("Provider details")';
const notRecognizedProviderLabel = 'div:contains("Provider not recognized")';
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

export const clickSelectedHost = () =>
  cy.get(`#host-${selectedHost.agentId}`).click();

export const clickClusterNameLabel = () => cy.get(clusterNameLabel).click();

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

export const notRecognizedProviderIsDisplayed = () =>
  cy.get(notRecognizedProviderLabel).should('be.visible');

const _processAttributeName = (attributeHeaderName) => {
  const splittedAttribute = attributeHeaderName.toLowerCase().split(' ');
  if (splittedAttribute.length === 2)
    return splittedAttribute[0] + capitalize(splittedAttribute[1]);
  else return attributeHeaderName.toLowerCase();
};

export const expectedFieldValueIsDisplayed = (headerName) => {
  const attributeName = _processAttributeName(headerName);
  const expectedValue = selectedHost.sapInstance[attributeName];
  const tableHeaderSelector = `div[class="mt-8"]:contains("SAP instances") th:contains("${headerName}")`;
  const tableCellSelector =
    'div[class="mt-8"]:contains("SAP instances") tbody td';
  cy.get(tableHeaderSelector)
    .invoke('index')
    .then((i) => {
      const isPropertyArray = Array.isArray(expectedValue);
      if (isPropertyArray) {
        cy.wrap(expectedValue).each((value) => {
          cy.get(tableCellSelector).eq(i).should('contain', value);
        });
      } else {
        cy.get(tableCellSelector).eq(i).should('have.text', expectedValue);
      }
    });
};

// API
export const loadAwsHostDetails = () =>
  basePage.loadScenario('host-details-aws');
export const startAgentHeartbeat = () =>
  cy.task('startAgentHeartbeat', [selectedHost.agentId]);

export const stopAgentsHeartbeat = () => cy.task('stopAgentsHeartbeat');
