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
const firstCheckDefaultValue = `(Default: ${firstCheck.values[0].default})`;
const secondCheckValueName = `${secondCheck.values[0].name}:`;
const secondCheckDefaultValue = `${secondCheck.values[0].default}:`;
const firstCurrentCheckValue = `${firstCheck.values[0].default}`;
const modalWarningCheckboxLabel =
  'Trento and SUSE are not responsible for cluster operation failure due to deviation from Best Practices.';
const inputValidationErrorLabel =
  'Some of the values are invalid. Please correct them and try again';
const customValue = '100';
const customMixedValue = '30000a';
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

// Selectors
const corosyncCategory = `div[class="pb-4"] h3.tn-check-switch:contains("${corosyncLabel}")`;
const checksCustomizationSettingsIcon =
  'a[class*="block"] button[aria-label="customize-check"] svg';
const resetCustomizedCheckIcon =
  'a[class*="block"] button[aria-label="reset-check-customization"] svg';
const modifiedPill = `a[class*="block"] span:contains("${modifiedPillLabel}")`;
const modalDescrition = 'div[class="mt-2"] p';
const modalSpan = 'div[class="mt-2"] span';
const modalInput = 'div[class="mt-2"] input';
const modalValueDefault = 'div[class="mt-2"] label';
const modalProviderSvg = 'div[class="mt-2"] span img';
const resetModalTitle = 'div[class*="space-y-4"] h2';
const resetModalWarning = 'div[class="mt-2"] div[class*="text-gray"]';
const validationError = 'div[class="mt-2"] div p[class*="text-red"]';
const saveButtonModal = 'button:contains("Save")';
const resetCheckButtonModal = 'button:contains("Reset Check")';
const closeCheckButtonModal = 'button:contains("Close")';
const resetButton = 'button:contains("Reset")';
const checkCustomizationToastSuccess = `p:contains(${checkCustomizationToastSuccessLabel})`;
const checkCustomizationToastReset = `p:contains(${checkCustomizationToastResetLabel})`;

//UI interactions
export const clickCorosyncCategory = () => cy.get(corosyncCategory).click();
export const openCustomizationModalFirstCheck = () =>
  cy.get(checksCustomizationSettingsIcon).eq(0).click();
export const openCustomizationModalSecondCheck = () =>
  cy.get(checksCustomizationSettingsIcon).eq(1).click();
export const clickOnWarningCheckbox = () => cy.get(modalInput).eq(0).click();
export const clickResetCheckModalButton = () =>
  cy.get(resetCheckButtonModal).click();
export const clickCloseButton = () => cy.get(closeCheckButtonModal).click();
export const clickResetButton = () => cy.get(resetButton).click();
export const clickResetModalButton = () => cy.get(resetButton).eq(1).click();
export const clickResetCustomizedCheck = () =>
  cy.get(resetCustomizedCheckIcon).click();
export const clickModalSaveButton = () => cy.get(saveButtonModal).eq(1).click();
const _setInputValue = (element, index, value) => {
  cy.get(element)
    .eq(index)
    .should('be.visible')
    .clear()
    .type(value)
    .should('have.value', value);
};
export const inputCustomCheckValue = () =>
  _setInputValue(modalInput, 1, customValue);
export const inputInvalidCheckValue = () =>
  _setInputValue(modalInput, 1, customMixedValue);

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
  cy.get(modalDescrition).should('contain', firstCheck.description);
export const modalWarningCheckBoxShouldNotBeChecked = () =>
  cy.get(modalInput).eq(0).should('not.be.checked');
export const modalWarningCheckBoxShouldBeChecked = () =>
  cy.get(modalInput).eq(0).should('be.checked');
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
const _validateModalInputValue = (input, index, value) =>
  cy.get(input).eq(index).should('have.value', value);
export const validateCurrentValueFromWandaFirstCheck = () =>
  _validateModalInputValue(modalInput, 1, firstCurrentCheckValue);
export const validateCustomizedValue = () => {
  _validateModalInputValue(modalInput, 0, customValue);
};
export const validateProviderLabel = () =>
  cy.get(modalValueDefault).eq(1).should('have.text', modalProviderLabel);
export const validateProviderValue = () =>
  cy.get(modalSpan).eq(1).should('have.text', modalProviderValue);
export const providerIconShouldBeDisplayed = () => {
  cy.get(modalProviderSvg)
    .should('be.visible')
    .and('have.attr', 'alt', 'azure');
};
export const validateResetModalTitle = () =>
  cy.get(resetModalTitle).should('contain', resetModalTitleLabel);
export const validateResetModalWarningText = () =>
  cy.get(resetModalWarning).eq(1).should('have.text', resetModalText);
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
