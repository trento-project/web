export * from './base_po.js';
import * as basePage from './base_po.js';

import {
  catalogCheckFactory,
  catalogValueFactory,
} from '@lib/test-utils/factories';

import { availableHanaCluster } from '../fixtures/hana-cluster-details/available_hana_cluster.js';

const url = '/clusters';

// Test data
const firstCheck = catalogCheckFactory.build({
  id: '00081D',
  description:
    'Corosync is running with max_messages set to the recommended value',
  values: [
    catalogValueFactory.build({
      name: 'expected_max_messages',
      default: '20',
      customizable: true,
    }),
  ],
});
const secondCheck = catalogCheckFactory.build({
  id: '156F64',
  description: 'Corosync `token` timeout is set to expected value',
  values: [
    catalogValueFactory.build({
      name: 'expected_token_timeout',
      default: '30000',
      customizable: true,
    }),
  ],
});
const checkList = [firstCheck, secondCheck];
const firstCheckValueName = `${firstCheck.values[0].name}:`;
const firstCheckValue = firstCheck.values[0].default;
const firstCheckDefaultValue = `(Default: ${firstCheckValue})`;
const firstCheckDescription = firstCheck.description;
const secondCheckValueName = `${secondCheck.values[0].name}:`;
const secondCheckDefaultValue = `${secondCheck.values[0].default}:`;
const firstCurrentCheckValue = `${firstCheck.values[0].default}`;
const modalWarningCheckboxLabel =
  'Trento and SUSE are not responsible for cluster operation failure due to deviation from Best Practices.';
const inputValidationErrorLabel =
  'Some of the values are invalid. Please correct them and try again';
const customValue = '100';

const corosyncLabel = 'Corosync';
const modifiedPillLabel = 'MODIFIED';
const modalProviderLabel = 'Provider';
const modalProviderValue = 'Azure';
const resetModalTitleLabel = 'Reset check: 00081D';
const resetModalText =
  'You are about to reset custom checks values. Would you like to continue?';
const checkCustomizationToastSuccessLabel = 'Check was customized successfully';
const checkCustomizationToastResetLabel = 'Customization was reset!';
const checkCustomizationToastErrorLabel = 'Failed to customize check';
const checkStatus = 'Critical';
const evaluationResults = `Corosync 'max_messages' value was expected to be '${customValue}' but value of running config is '${firstCheckValue}'`;

// Selectors
const corosyncCategory = `div[class="pb-4"] h3.tn-check-switch:contains("${corosyncLabel}")`;
const resetCustomizedCheckIcon =
  'a[class*="block"] button[aria-label="reset-check-customization"] svg';
const modifiedPill = `a[class*="block"] span:contains("${modifiedPillLabel}")`;
const modalDescrition = 'div[class="mt-2"] p';
const modalSpan = 'div[class="mt-2"] span';
const modalProviderValueSpan = `div[class="mt-2"] span:contains("${modalProviderValue}")`;
const modalCheckbox = 'div input[type="checkbox"]';
const modalInput = 'input[class*="rc-input"]';
const modalValueDefault = 'div[class="mt-2"] label';
const modalProvider = `div[class="mt-2"] label:contains("${modalProviderLabel}")`;
const modalProviderSvg = 'div[class="mt-2"] span img';
const resetModalTitle = 'div[class*="space-y-4"] h2';
const resetModalWarning = `div[class="mt-2"] div[class*="text-gray"]:contains("${resetModalText}")`;
const validationError = 'div[class="mt-2"] div p[class*="text-red"]';

const saveButtonModal =
  'div[class*="rounded"]:contains("Check: ") button:contains("Save")';
const resetCheckButtonModal = 'button:contains("Reset Check")';
const closeCheckButtonModal = 'button:contains("Close")';
const resetButton =
  'div[class*="rounded"]:contains("Reset check:") button:contains("Reset")';
const saveChecksSelectionButton = 'button:contains("Save Checks Selection")';
const startExecutionButton = 'button:contains("Start Execution")';
const checkCustomizationToastSuccess = `p:contains(${checkCustomizationToastSuccessLabel})`;
const checkCustomizationToastReset = `p:contains(${checkCustomizationToastResetLabel})`;
const corosyncheckSelectionToggle =
  'div[aria-label="accordion-header"]:contains("Corosync") button';

const modifiedCheckID = 'tbody tr td span[class="inline-flex leading-5"]';
const modifiedResultCriticalIcon = 'svg[class="hover:opacity-75 fill-red-500"]';

const checkResultDescription = `tbody tr td div p:contains(${firstCheckDescription})`;
const unMetExpectations = '0/1 Expectations met.';
const hostExpectationsNotMet = `tbody tr[class*="overflow-y-hidden"] span[class="text-red-500"]:contains(${unMetExpectations})`;
const evaluationResultsStatus = `div[class="py-4"] div[class*="text-red"] span:contains('${checkStatus}')`;
const evaluationResultsLabel = `div[class="py-4"] div[class*="text-red"] span:contains(${evaluationResults})`;

const customizedValue =
  'div[class*="w-full my-4 mr-4"]  span[class="align-middle"]';
const gatheredFactsValue = `div[class*="w-full my-4 mr-4"]:contains("Gathered Facts") div[class=''] span:contains(${firstCheckValue})`;
//UI interactions
export const clickCorosyncCategory = () => cy.get(corosyncCategory).click();
export const openCheckCustomizationModal = (checkID) => {
  const checksCustomizationSettingsIcon = `a[class*="block"] button[aria-label*="customize-check-${checkID}"]`;
  cy.get(checksCustomizationSettingsIcon).click();
};
export const clickOnWarningCheckbox = () => cy.get(modalCheckbox).click();
export const clickResetCheckModalButton = () =>
  cy.get(resetCheckButtonModal).click();
export const clickCloseButton = () => cy.get(closeCheckButtonModal).click();
export const clickResetButton = () => cy.get(resetButton).click();
export const clickResetModalButton = () => cy.get(resetButton).click();
export const clickResetCustomizedCheck = () =>
  cy.get(resetCustomizedCheckIcon).click();
export const clickModalSaveButton = () => cy.get(saveButtonModal).click();
const _setInputValue = (newValue) => {
  cy.get('div[class*="flex-col"]:contains("Default") + div input')
    .clear()
    .type(newValue)
    .should('have.value', newValue);
};
export const clickSaveChecksSelectionButton = () =>
  cy.get(saveChecksSelectionButton).click();
export const clickStartExecutionButton = () =>
  cy.get(startExecutionButton).click();
export const inputCheckValue = (newValue) => {
  _setInputValue(newValue);
};

export const clickCorosyncSelectionToggle = () => {
  cy.get(corosyncheckSelectionToggle).click();
};

export const clickOnCheckResultDescription = () => {
  cy.get(checkResultDescription).click();
};

export const clickModifiedCheckExpectations = () => {
  cy.get(hostExpectationsNotMet).first().click();
};

// UI validations
export const resetIconShouldNotExistInOverview = () =>
  cy.get(resetCustomizedCheckIcon).should('not.exist');
export const customizedCheckShouldHaveModifiedPill = () =>
  cy.get(modifiedPill).should('contain', modifiedPillLabel);
export const customizedCheckShouldNotHaveModifiedPill = () =>
  cy.get(modifiedPill).should('not.exist');
export const secondCustomizedCheckShouldNotHaveModifiedPill = () =>
  cy.get(modifiedPill).should('not.exist');
const _validateCheckId = (value) =>
  cy.contains(`Check: ${value}`).should('contain', value);
export const validateFirstCheckId = () => _validateCheckId(firstCheck.id);
export const validateSecondCheckId = () => _validateCheckId(secondCheck.id);
export const validateFirstCheckDescription = () =>
  cy.get(modalDescrition).should('contain', firstCheckDescription);
export const modalWarningCheckBoxShouldNotBeChecked = () =>
  cy.get(modalCheckbox).should('not.be.checked');
export const modalWarningCheckBoxShouldBeChecked = () =>
  cy.get(modalCheckbox).should('be.checked');
export const validateWarningMessage = () =>
  cy.get(modalSpan).should('contain', modalWarningCheckboxLabel);
const _validateValueNameAndDefaultValue = (valueName, defaultValue) => {
  cy.get(modalValueDefault)
    .should('contain', valueName)
    .and('contain', defaultValue);
};

export const validateFirstCheckValueNameAndDefaultValue = () =>
  _validateValueNameAndDefaultValue(
    firstCheckValueName,
    firstCheckDefaultValue
  );
export const validateSecondCheckValueNameAndDefaultValue = () => {
  _validateValueNameAndDefaultValue(
    secondCheckValueName,
    secondCheckDefaultValue
  );
};

export const validateCurrentValueFromWandaFirstCheck = () =>
  _validateModalInputValue(modalInput, firstCurrentCheckValue);
export const validateCustomizedValue = () => {
  _validateModalInputValue(modalInput, customValue);
};

const _validateModalInputValue = (element, expectedValue) => {
  cy.get(`${element}[value="${expectedValue}"]`)
    .should('be.visible')
    .and('have.value', expectedValue);
};

export const validateProviderLabel = () =>
  cy.get(modalProvider).should('have.text', modalProviderLabel);
export const validateProviderValue = () =>
  cy.get(modalProviderValueSpan).should('have.text', modalProviderValue);
export const providerIconShouldBeDisplayed = () => {
  cy.get(modalProviderSvg)
    .should('be.visible')
    .and('have.attr', 'alt', 'azure');
};
export const validateResetModalTitle = () =>
  cy.get(resetModalTitle).should('contain', resetModalTitleLabel);
export const validateResetModalWarningText = () =>
  cy.get(resetModalWarning).should('have.text', resetModalText);
export const inputValidationErrorShouldBeDisplayed = () =>
  cy.get(validationError).should('contain', inputValidationErrorLabel);
const _toastShouldBeVisible = (label) => cy.get(label).should('be.visible');
export const checkCustomizationSuccessToastIsShown = () =>
  _toastShouldBeVisible(checkCustomizationToastSuccess);
export const checkCustomizationResetToastIsShown = () =>
  _toastShouldBeVisible(checkCustomizationToastReset);
export const checkCustomizationErrorToastIsShown = () =>
  cy.get('body').should('contain', checkCustomizationToastErrorLabel);
const _buttonEnabled = (button) => cy.get(button).should('be.enabled');
const _buttonDisabled = (button) => cy.get(button).should('be.disabled');
export const modalSaveButtonShouldBeEnabled = () =>
  _buttonEnabled(saveButtonModal);
export const modalSaveButtonShouldBeDisabled = () =>
  _buttonDisabled(saveButtonModal);
export const resetCheck_buttonEnabled = () =>
  _buttonEnabled(resetCheckButtonModal);
export const modalResetCheckButtonShouldBeDisabled = () =>
  _buttonDisabled(resetCheckButtonModal);
export const modalCloseButtonShouldBeEnabled = () =>
  _buttonEnabled(closeCheckButtonModal);

export const waitForCustomizedCheckElements = () => {
  cy.contains(modifiedCheckID, firstCheck.id).should('be.visible', {
    timeout: 20000,
  });
  cy.contains(modifiedPillLabel).should('be.visible');
  cy.contains('tr.tn-check-result-row', firstCheck.description)
    .find(modifiedResultCriticalIcon)
    .should('be.visible');
};
export const validateCheckStatus = () => {
  cy.get(evaluationResultsStatus)
    .should('be.visible')
    .and('have.text', checkStatus);
};
export const validateEvaluationResultsDescription = () => {
  cy.get(evaluationResultsLabel)
    .should('be.visible')
    .and('have.text', evaluationResults);
};

export const validateEvaluationResultsModifiedPill = () => {
  cy.contains(modifiedPillLabel).should('be.visible');
};

export const validateCusomValue = () => {
  cy.get(customizedValue).should('have.text', customValue);
};

export const vailidateGatheredFactsValue = () => {
  cy.get(gatheredFactsValue).should('have.text', firstCheckValue);
};

// Api
export const visit = (clusterId = '') => basePage.visit(`${url}/${clusterId}`);
export const visitChecksSelectionCluster = () => visit(availableHanaCluster.id);
export const clickOnCheckSelectionButton = () =>
  cy.get('button').contains('Check Selection').click();
const _resetCheck = (groupId, checkId) =>
  basePage.apiLogin().then(({ accessToken }) =>
    cy.request({
      method: 'DELETE',
      url: `${Cypress.config(
        'wandaUrl'
      )}/api/v1/groups/${groupId}/checks/${checkId}/customization`,
      auth: { bearer: accessToken },
      failOnStatusCode: false,
    })
  );
const _resetChecks = (checks) => {
  checks.forEach(({ id }) => {
    _resetCheck(availableHanaCluster.id, id);
  });
};
export const apiResetAllChecks = () => _resetChecks(checkList);

export const apiResetCheckSelection = () =>
  basePage.apiSelectChecks('469e7be5-4e20-5007-b044-c6f540a87493', []);
