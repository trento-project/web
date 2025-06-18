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
  'div[class="font-bold"]:contains("Agent Version") + div';
const architectureLabel =
  'div[class="font-bold"]:contains("Architecture") + div';
const ipAddressesLabel =
  'div[class="font-bold"]:contains("IP Addresses") + div';
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
const relevantPatches = 'p:contains("Relevant Patches")';
const relevantPatchesAmount = `${relevantPatches} + div div`;
const hostPatchesViewTitle = 'h1:contains("Relevant Patches") span';
const synopsisCell1 = 'td:contains("SUSE-15-SP4-2024-630") + td';
const synopsisCell2 = 'td:contains("SUSE-15-SP4-2024-619") + td';
const backToHostDetailsButton = 'button:contains("Back to Host Details")';
const upgradablePackagesCard = 'p:contains("Upgradable Packages")';
const upgradablePackagesCardAmount = `${upgradablePackagesCard} + div`;
const elixirLatestPackage = 'td:contains("elixir-1.15.7-3.x86_64") + td';
const firstRelatedPackage =
  'td:contains("elixir-1.15.7-3.x86_64") + td + td button:eq(0)';
const synopsisViewSecurityUpdate = 'h2:contains("Synopsis") + div p';
const synopsisIssuedDateLabel = 'div[class*="text"]:contains("Issued") + div';
const synopsisStatusLabel = 'div[class*="text"]:contains("Status") + div';
const synopsisRebootRequiredLabel =
  'div[class*="text"]:contains("Reboot") + div';
const synopsisPackageMaintenanceLabel =
  'div[class*="text"]:contains("Affects Package Maintenance Stack") + div';
const advisoryDetailsDescription = 'h2:contains("Description") + div';
const advisoryDetailsFixes = 'h2:contains("Fixes") + div';
const advisoryDetailsCVEs = 'h2:contains("CVEs") + div a';
const advisoryDetailsAffectedPackages =
  'h2:contains("Affected Packages") + div li:eq(0)';
const advisoryDetailsAffectedSystems = 'h2:contains("Affected Systems") + div';

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

export const visitVmdrbddev01Host = () =>
  basePage.visit('/hosts/240f96b1-8d26-53b7-9e99-ffb0f2e735bf');

export const visitVmdrbddev02Host = () =>
  basePage.visit('/hosts/21de186a-e38f-5804-b643-7f4ef22fecfd');

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

export const clickRelevantPatches = () => cy.get(relevantPatches).click();

export const clickBackToHostDetailsButton = () =>
  cy.get(backToHostDetailsButton).click();

export const clickUpgradablePackagesCard = () =>
  cy.get(upgradablePackagesCard).click();

export const clickFirstRelatedPackage = () =>
  cy.get(firstRelatedPackage).click();

//Validations
export const advisoryDetailsAffectedSystemsAreTheExpected = () =>
  cy
    .get(advisoryDetailsAffectedSystems)
    .should('contain', 'vmdrbddev01vmdrbddev02');

export const advisoryDetailsAffectedPackageIsTheExpected = () =>
  cy.get(advisoryDetailsAffectedPackages).should('contain', 'elixir');

export const advisoryDetailsCVEsAreTheExpected = () =>
  cy
    .get(advisoryDetailsCVEs)
    .each(($el) => cy.wrap($el).should('contain', 'SUSE-15-SP4'));

export const advisoryDetailsShowsExpectedFixes = () =>
  cy.get(advisoryDetailsFixes).should('contain', 'VUL-0');

export const advisoryDetailsShowsExpectedDescription = () =>
  cy
    .get(advisoryDetailsDescription)
    .should('have.text', 'Minor security bug fixes');

export const affectsPkgMaintenanceLabelIsTheExpected = () =>
  cy.get(synopsisPackageMaintenanceLabel).should('have.text', 'No');

export const synopsisRebootRequiredLabelIsTheExpected = () =>
  cy.get(synopsisRebootRequiredLabel).should('have.text', 'Yes');

export const synopsisStatusLabelIsTheExpected = () =>
  cy.get(synopsisStatusLabel).should('have.text', 'stable');

export const synopsisIssuedDateIsTheExpected = () =>
  cy.get(synopsisIssuedDateLabel).should('have.text', '27 Feb 2024');

export const expectedSynopsisSecurityUpdateIsDisplayed = () =>
  cy
    .get(synopsisViewSecurityUpdate)
    .should('have.text', 'important: Security update for java-1_8_0-ibm');

export const expectedRelatedPackageIsDisplayed = () =>
  cy.get(firstRelatedPackage).should('have.text', 'SUSE-15-SP4-2024-630');

export const elixirLatestPackageIsTheExpected = () =>
  cy.get(elixirLatestPackage).should('have.text', 'elixir-1.16.2-1.x86_64');

export const upgradablePackagesAmountIsTheExpected = (expectedValue) =>
  cy.get(upgradablePackagesCardAmount).should('have.text', expectedValue);

export const expectedSynopsisText1IsDisplayed = () =>
  cy
    .get(synopsisCell1)
    .should('have.text', 'Recommended update for cloud-netconfig');

export const expectedSynopsisText2IsDisplayed = () =>
  cy
    .get(synopsisCell2)
    .should('have.text', 'important: Security update for java-1_8_0-ibm');

export const expectedHostIsDisplayedInTitle = () =>
  cy.get(hostPatchesViewTitle).should('have.text', 'vmdrbddev01');

export const expectedRelevantPatchesAreDisplayed = (expectedValue) =>
  cy.get(relevantPatchesAmount).should('have.text', expectedValue);

export const validateSelectedHostUrl = () =>
  basePage.validateUrl(`${url}/${selectedHost.agentId}`);

export const clusterNameHasExpectedValue = () =>
  cy.get(clusterNameLabel).should('have.text', selectedHost.clusterName);

export const agentVersionHasExpectedValue = () =>
  cy.get(agentVersionLabel).should('have.text', selectedHost.agentVersion);

export const architectureHasExpectedValue = () =>
  cy.get(architectureLabel).should('have.text', selectedHost.arch);

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
  cy.get(heartbeatFailingToaster, { timeout: 20000 }).should('be.visible');

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

export const apiCreateUserWithHostChecksExecutionAbilities = () =>
  basePage.apiCreateUserWithAbilities([
    {
      name: 'all',
      resource: 'host_checks_execution',
    },
  ]);

export const apiCreateUserWithChecksSelectionAbilities = () =>
  basePage.apiCreateUserWithAbilities([
    {
      name: 'all',
      resource: 'host_checks_selection',
    },
  ]);

export const apiCreateUserWithHostCleanupAbilities = () =>
  basePage.apiCreateUserWithAbilities([
    {
      name: 'cleanup',
      resource: 'host',
    },
  ]);

export const saveSUMASettingsForAdmin = () =>
  basePage.saveSUMASettings({
    url: 'https://trento.io',
    username: 'suseManagerAdmin',
    password: 'suseManagerPw',
  });
