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

// Modal check values
const firstCheckValueName = `${firstCheck.values[0].name}:`;
const firstCheckDefaultValue = `(Default: ${firstCheck.values[0].default})`;
const secondCheckValueName = `${secondCheck.values[0].name}:`;
const secondCheckDefaultValue = `${secondCheck.values[0].default}:`;
const firstCurrentCheckValue = `${firstCheck.values[0].default}`;
const modalWarningCheckboxLabel =
  'Trento and SUSE are not responsible for cluster operation failure due to deviation from Best Practices.';
const userInputValidationErrorLabel =
  'Some of the values are invalid. Please correct them and try again';
const userValidationError = '.text-red-500';

// User input data
const customValue = '100';
const customMixedValue = '30000a';

// Selectors

//Checks overview
const checksCategorySwitch = '.tn-check-switch';
const corosyncLabel = 'Corosync';
const checkCustomModalSettingsIconFirstCheck =
  ':nth-child(1) > .block > .px-4 > .mt-2 > .flex > .inline > [data-testid="eos-svg-component"] > path';
const checkCustomModalSettingsIconFirstCheckAfterCustomization =
  ':nth-child(1) > .block > .px-4 > .mt-2 > .flex > .mr-4 > [data-testid="eos-svg-component"]';
const checkCustomModalSettingsIconSecondCheck =
  ':nth-child(2) > .block > .px-4 > .mt-2 > .flex > .mr-4 > [data-testid="eos-svg-component"]';
const resetCustomizedCheckIcon = '.mr-2 > [data-testid="eos-svg-component"]';
const modifiedPillLabel = 'MODIFIED';
const modifiedPill = '.block > .px-4 > :nth-child(1) > .bg-white';

// Modal elements and values
const modalDescrition = '.mt-2 > .text-gray-500';
const modalWarningText = '.border-yellow-400 > .font-semibold';
const modalWarningCheckbox = '.border-yellow-400 > div > .rc-input';
const modalValueDefault = '.flex-col > .font-bold';
const modalValueCurrentValue = '.space-x-4 > div.w-full > .rc-input';
const modalProvider = ':nth-child(4) > .w-1\\/3';
const modalProviderLabel = 'Provider';
const modalProviderInput = 'div.relative > div.w-full > .rc-input';
const modalProviderValue = 'Azure';
const modalProviderIcon = '.absolute > .flex > .mr-2';
const resetModalText =
  'You are about to reset custom checks values. Would you like to continue?';
const resetModalWarning = '.mt-2 > .text-gray-500';
// Button in modal
const saveButtonModal = 'button:contains("Save")';
const resetCheckButtonModal = 'button:contains("Reset Check")';
const closeCheckButtonModal = 'button:contains("Close")';
const resetModalLabel = 'Reset';
const resetModalButton = '.mt-2 > .flex > .bg-jungle-green-500';

// Toast messages for checks customization
const checkCustomizationToastSuccessLabel = 'Check was customized successfully';
const checkCustomizationToastSuccess = `p:contains(${checkCustomizationToastSuccessLabel})`;
const checkCustomizationToastResetLabel = 'Customization was reset!';
const checkCustomizationToastReset = `p:contains(${checkCustomizationToastResetLabel})`;
const checkCustomizationToastErrorLabel = 'Failed to customize check';

//UI interactions
export const corosyncCategoryClick = () =>
  cy.get(checksCategorySwitch).contains(corosyncLabel).click();

export const openCustomizationModalFirstCheck = () => {
  cy.get(checkCustomModalSettingsIconFirstCheck).first().click({ force: true });
};

export const openCustomizationModalFirstCheckAfterCustomization = () => {
  cy.get(checkCustomModalSettingsIconFirstCheckAfterCustomization)
    .first()
    .click({ force: true });
};

export const openCustomizationModalSecondCheck = () => {
  cy.get(checkCustomModalSettingsIconSecondCheck)
    .first()
    .click({ force: true });
};

// User clicks on element
export const userClickOnWarningCheckbox = () =>
  cy.get(modalWarningCheckbox).click();

export const userClickResetModalButton = () =>
  cy.get(resetCheckButtonModal).click();
export const userClickCloseButton = () => cy.get(closeCheckButtonModal).click();

export const userClickResetButton = () =>
  cy.get(resetModalButton).contains(resetModalLabel).click();

export const userClickResetCustomizedCheck = () =>
  cy.get(resetCustomizedCheckIcon).click();

export const userClickModalSaveButton = () =>
  cy.get('.w-80 > .bg-jungle-green-500').click();

// User input
const setInputValue = (element, value) => {
  cy.get(element)
    .should('be.visible')
    .clear()
    .type(value)
    .should('have.value', value);
};

export const userInputCustomCheckValue = () => {
  setInputValue(modalValueCurrentValue, customValue);
};
export const userInputInvalidCheckValue = () => {
  setInputValue(modalValueCurrentValue, customMixedValue);
};

// UI validations

// Checks overview
export const resetIconShouldNotExistInOverview = () =>
  cy.get(resetCustomizedCheckIcon).should('not.exist');
export const customizedCheckShouldHaveModifiedPill = () =>
  cy.get(modifiedPill).should('contain', modifiedPillLabel);
export const customizedCheckShouldNotHaveModifiedPill = () =>
  cy.get(modifiedPill).should('not.exist');
export const secondCustomizedCheckShouldNotHaveModifiedPill = () =>
  cy.get(modifiedPill).should('not.exist');

// buttons
const buttonEnabled = (button) => cy.get(button).should('be.enabled');
const buttonDisabled = (button) => cy.get(button).should('be.disabled');
export const modalSaveButtonShouldBeEnabled = () =>
  buttonEnabled(saveButtonModal);
export const modalSaveButtonShouldBeDisabled = () =>
  buttonDisabled(saveButtonModal);
export const resetCheckButtonEnabled = () =>
  buttonEnabled(resetCheckButtonModal);
export const modalResetCheckButtonShouldBeDisabled = () => {
  buttonDisabled(resetCheckButtonModal);
};
export const modalCloseButtonShouldBeEnabled = () => {
  buttonEnabled(closeCheckButtonModal);
};
export const closeButtonDisabled = () => {
  buttonDisabled(closeCheckButtonModal);
};

// Validation of values
const validateCheckId = (value) =>
  cy.contains(`Check: ${value}`).should('contain', value);
export const validateFirstCheckId = () => validateCheckId(firstCheck.id);
export const validateSecondCheckId = () => validateCheckId(secondCheck.id);
export const validateFirstCheckDescription = () =>
  cy.get(modalDescrition).should('contain', firstCheck.description);
export const modalWarningCheckBoxShouldNotBeChecked = () =>
  cy.get(modalWarningCheckbox).should('not.be.checked');
export const modalWarningCheckBoxShouldBeChecked = () =>
  cy.get(modalWarningCheckbox).should('be.checked');
export const validateWarningMessage = () =>
  cy.get(modalWarningText).should('contain', modalWarningCheckboxLabel);

const validateValueNameAndDefaultValue = (valueName, defaultValue) => {
  cy.get(modalValueDefault)
    .should('contain', valueName)
    .and('contain', defaultValue);
};
export const validateFirstCheckValueNameAndDefaultValue = () => {
  validateValueNameAndDefaultValue(firstCheckValueName, firstCheckDefaultValue);
};
export const validateSecondCheckValueNameAndDefaultValue = () => {
  validateValueNameAndDefaultValue(
    secondCheckValueName,
    secondCheckDefaultValue
  );
};
const validateValue = (element, value) =>
  cy.get(element).should('have.value', value);
export const validateCurrentValueFromWandaFirstCheck = () =>
  validateValue(modalValueCurrentValue, firstCurrentCheckValue);

export const validateCustomizedValue = () => {
  validateValue(modalValueCurrentValue, customValue);
};

export const validateProvider = () =>
  cy.get(modalProvider).should('contain', modalProviderLabel);
export const validateProviderValue = () =>
  cy.get(modalProviderInput).should('contain', modalProviderValue);
export const providerIconShouldBeDisplayed = () => {
  cy.get(modalProviderIcon)
    .should('be.visible')
    .and('have.attr', 'alt', 'azure');
};
export const validateResetWarningText = () =>
  cy.get(resetModalWarning).should('contain', resetModalText);

export const userInputValidationErrorShouldBeDisplayed = () =>
  cy.get(userValidationError).should('contain', userInputValidationErrorLabel);

// Toast messages for checks customization
const toastShouldBeVisible = (label) => {
  cy.get(label).should('be.visible');
};
export const checkCustomizationSuccessToastIsShown = () =>
  toastShouldBeVisible(checkCustomizationToastSuccess);
export const checkCustomizationResetToastIsShown = () =>
  toastShouldBeVisible(checkCustomizationToastReset);
export const checkCustomizationErrorToastIsShown = () =>
  cy.get('body').should('contain', checkCustomizationToastErrorLabel);

// Api

// Page navigation
export const visit = (clusterId = '') => {
  basePage.visit(`${url}/${clusterId}`);
};
export const visitChecksSelectionCluster = () => visit(availableHanaCluster.id);

export const clickOnCheckSelectionButton = () =>
  cy.get('button').contains('Check Selection').click();

// Reset checks
const resetCheck = (groupId, checkId) =>
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

const resetChecks = (checks) => {
  checks.forEach(({ id }) => {
    resetCheck(availableHanaCluster.id, id);
  });
};

export const resetAllChecks = () => resetChecks(checkList);
