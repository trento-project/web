export * from './base_po.js';
import * as basePage from './base_po.js';

import {
  checksExecutionCompletedFactory,
  catalogCheckFactory,
  catalogValueFactory,
} from '@lib/test-utils/factories';

import { availableHanaCluster } from '../fixtures/hana-cluster-details/available_hana_cluster.js';

const lastExecution = checksExecutionCompletedFactory.build({
  group_id: availableHanaCluster.id,
  passing_count: 5,
  warning_count: 3,
  critical_count: 1,
});

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

const catalog = catalogCheckFactory.buildList(5);

// Attributes
const url = '/clusters';
const catalogEndpointAlias = 'catalog';
const lastExecutionEndpointAlias = 'lastExecution';

export const visit = (clusterId = '') => {
  basePage.visit(`${url}/${clusterId}`);
  if (clusterId !== '') {
    basePage.waitForRequest(lastExecutionEndpointAlias);
    basePage.waitForRequest(catalogEndpointAlias);
  }
};

export const visitChecksSelectionCluster = () => visit(availableHanaCluster.id);
export const clickOnCheckSelectionButton = () =>
  cy.get('button').contains('Check Selection').click();

// API
export const interceptLastExecutionRequest = () => {
  const lastExecutionURL = '/api/v2/checks/groups/**/executions/last';
  cy.intercept(lastExecutionURL, {
    body: lastExecution,
  }).as(lastExecutionEndpointAlias);
};

export const interceptCatalogRequest = () => {
  const catalogURL = '/api/v3/checks/catalog*';
  cy.intercept(catalogURL, { body: { items: catalog } }).as(
    catalogEndpointAlias
  );
};

export const expectedClusterNameIsDisplayedInHeader = () =>
  basePage.pageTitleIsCorrectlyDisplayed(availableHanaCluster.name);

const checksCategorySwitch = '.tn-check-switch';
const corosyncLabel = 'Corosync';

export const corosyncCategoryClick = () =>
  cy.get(checksCategorySwitch).contains(corosyncLabel).click();

const checkCustomModalSettingsIconFirstCheck =
  ':nth-child(1) > .block > .px-4 > .mt-2 > .flex > .inline > [data-testid="eos-svg-component"] > path';
export const openCustomizationModalFirstCheck = () => {
  cy.get(checkCustomModalSettingsIconFirstCheck).first().click({ force: true });
};
const checkCustomModalSettingsIconFirstCheckAfterCustomization =
  ':nth-child(1) > .block > .px-4 > .mt-2 > .flex > .mr-4 > [data-testid="eos-svg-component"]';
export const openCustomizationModalFirstCheckAfterCustomization = () => {
  cy.get(checkCustomModalSettingsIconFirstCheckAfterCustomization)
    .first()
    .click({ force: true });
};

const checkCustomModalSettingsIconSecondCheck =
  ':nth-child(2) > .block > .px-4 > .mt-2 > .flex > .mr-4 > [data-testid="eos-svg-component"]';
export const openCustomizationModalSecondCheck = () => {
  cy.get(checkCustomModalSettingsIconSecondCheck)
    .first()
    .click({ force: true });
};

// Modal elements and values

const modalTitle = '#headlessui-dialog-title-\\:r1m\\:';
const modalTitleSecondCheck = '#headlessui-dialog-title-\\:r21\\:';
const modalDescrition = '.mt-2 > .text-gray-500';
const modalWarningText = '.border-yellow-400 > .font-semibold';
const modalWarningCheckbox = '.border-yellow-400 > div > .rc-input';
const modalWarningCheckboxLabel =
  'Trento and SUSE are not responsible for cluster operation failure due to deviation from Best Practices.';
const modalValueDefault = '.flex-col > .font-bold';
const modalValueCurrentValue = '.space-x-4 > div.w-full > .rc-input';
const modalProvider = ':nth-child(4) > .w-1\\/3';
const modalProviderLabel = 'Provider';
const modalProviderInput = 'div.relative > div.w-full > .rc-input';
const modalProviderValue = 'Azure';
const modalProviderIcon = '.absolute > .flex > .mr-2';

const resetCustomizedCheckIcon = '.mr-2 > [data-testid="eos-svg-component"]';
const resetModalText =
  'You are about to reset custom checks values. Would you like to continue?';
const resetModalWarning = '.mt-2 > .text-gray-500';

const firstCheckValueName = `${firstCheck.values[0].name}:`;
const firstCheckDefaultValue = `(Default: ${firstCheck.values[0].default})`;
const secondCheckValueName = `${secondCheck.values[0].name}:`;
const secondCheckDefaultValue = `${secondCheck.values[0].default}:`;
const firstCurrentCheckValue = `${firstCheck.values[0].default}`;

const modifiedPillLabel = 'MODIFIED';
const modifiedPill = '.block > .px-4 > :nth-child(1) > .bg-white';

// Toast messages for checks customization
const checkCustomizationToastSuccessLabel = 'Check was customized successfully';
const checkCustomizationToastSuccess = `p:contains(${checkCustomizationToastSuccessLabel})`;
const checkCustomizationToastResetLabel = 'Customization was reset!';
const checkCustomizationToastReset = `p:contains(${checkCustomizationToastResetLabel})`;
const checkCustomizationToastErrorLabel = 'Failed to customize check';

// Input validation
const userInputValidationErrorLabel =
  'Some of the values are invalid. Please correct them and try again';
const userValidationError = '.text-red-500';

// user Value input
const customValue = '100';
const customMixedValue = '30000a';

// Button status
const saveButtonModal = 'button:contains("Save")';
const resetCheckButtonModal = 'button:contains("Reset Check")';
const closeCheckButtonModal = 'button:contains("Close")';
const resetModalLabel = 'Reset';
const resetModalButton = '.mt-2 > .flex > .bg-jungle-green-500';

export const providerIconShouldBeDisplayed = () => {
  cy.get(modalProviderIcon)
    .should('be.visible')
    .and('have.attr', 'alt', 'azure');
};

// Validation of values

export const validateFirstCheckValueNameAndDefaultValue = () => {
  validateValueNameAndDefaultValue(firstCheckValueName, firstCheckDefaultValue);
};

export const validateSecondCheckValueNameAndDefaultValue = () => {
  validateValueNameAndDefaultValue(
    secondCheckValueName,
    secondCheckDefaultValue
  );
};

export const validateCustomizedValue = () => {
  validateValue(modalValueCurrentValue, customValue);
};

const validateValueNameAndDefaultValue = (valueName, defaultValue) => {
  cy.get(modalValueDefault)
    .should('contain', valueName)
    .and('contain', defaultValue);
};

const validateCheckId = (element, value) =>
  cy.get(element).should('contain', `Check: ${value}`);
export const validateFirstCheckId = () =>
  validateCheckId(modalTitle, firstCheck.id);
export const validateSecondCheckId = () =>
  validateCheckId(modalTitleSecondCheck, secondCheck.id);

export const validateFirstCheckDescription = () =>
  cy.get(modalDescrition).should('contain', firstCheck.description);
export const validateWarningMessage = () =>
  cy.get(modalWarningText).should('contain', modalWarningCheckboxLabel);

const validateValue = (element, value) =>
  cy.get(element).should('have.value', value);
export const validateCurrentValueFromWandaFirstCheck = () =>
  validateValue(modalValueCurrentValue, firstCurrentCheckValue);

export const validateProvider = () =>
  cy.get(modalProvider).should('contain', modalProviderLabel);
export const validateProviderValue = () =>
  cy.get(modalProviderInput).should('contain', modalProviderValue);

export const modalWarningCheckBoxShouldNotBeChecked = () =>
  cy.get(modalWarningCheckbox).should('not.be.checked');
export const modalWarningCheckBoxShouldBeChecked = () =>
  cy.get(modalWarningCheckbox).should('be.checked');

export const userInputValidationErrorShouldBeDisplayed = () =>
  cy.get(userValidationError).should('contain', userInputValidationErrorLabel);

export const validateResetWarningText = () =>
  cy.get(resetModalWarning).should('contain', resetModalText);

export const resetIconShouldNotExistInOverview = () =>
  cy.get(resetCustomizedCheckIcon).should('not.exist');

// User clicks on element
export const userClickOnWarningCheckbox = () =>
  cy.get(modalWarningCheckbox).click();

export const userClickResetModalButton = () =>
  cy.get(resetCheckButtonModal).click();
export const userClickCloseButton = () => cy.get(closeCheckButtonModal).click();

export const userClickResetButton = () =>
  cy.get(resetModalButton).contains(resetModalLabel).click();

export const userResetCustomizedCheck = () =>
  cy.get(resetCustomizedCheckIcon).click();

//  Check if Element is in View

export const customizedCheckShouldHaveModifiedPill = () =>
  cy.get(modifiedPill).should('contain', modifiedPillLabel);
export const customizedCheckShouldNotHaveModifiedPill = () =>
  cy.get(modifiedPill).should('not.exist');
export const secondCustomizedCheckShouldNotHaveModifiedPill = () =>
  cy.get(modifiedPill).should('not.exist');

// Modal Buttons

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

// user Value input
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
export const userClickModalSaveButton = () =>
  cy.get('.w-80 > .bg-jungle-green-500').click();

// Toast messages for checks customization
export const checkCustomizationToastIsShown = () =>
  cy.get(checkCustomizationToastSuccess).should('be.visible');
export const checkCustomizationResetToastIsShown = () =>
  cy.get(checkCustomizationToastReset).should('be.visible');
export const checkCustomizationErrorToastIsShown = () =>
  cy.get('body').should('contain', checkCustomizationToastErrorLabel);
