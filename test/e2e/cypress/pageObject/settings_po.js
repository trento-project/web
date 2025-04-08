export * from './base_po';
import * as basePage from './base_po';

import { subDays, addDays } from 'date-fns';
import {
  validCertificate,
  anotherValidCertificate,
  expiredCertificate,
} from '../fixtures/suma_credentials/certificates';
import { createUserRequestFactory } from '@lib/test-utils/factories';

// Selectors
const keyExpirationLabel = 'div[class*="mt-1"]';
const apiKeyCode = 'code';
const copyToClipboardButton = '[aria-label="copy to clipboard"]';
const generateApiKeyButton = 'button:contains("Generate Key")';
const modalGenerateApiKeyButton =
  'div[data-headlessui-state*="open"] button:contains("Generate")';
const confirmationGenerateApiKeyButton = '.generate-api-confirmation';
const apiKeyExpirationInput = '.rc-input-number-input';
const modalGeneratedApiKey = ':nth-child(1) > .w-full > code';
const modalCopyApiKeyButton = '.flex-col > :nth-child(1) > button';
const modalExpirationDateLabel = '.flex-col > :nth-child(2) > .text-gray-600';
const modalCloseButton = 'button:contains("Close")';
const expiredApiKeyToaster =
  'p:contains("API Key has expired. Go to Settings to issue a new key")';
const closeToExpireApiKeyToaster = 'p:contains("API Key expires in 9 days")';

// SUMA selectors

const sumaUrlLabel = '[aria-label="suma-url"]';
const sumaCertUploadDateLabel = '[aria-label="suma-cacert-upload-date"]';
const sumaUsernameLabel = '[aria-label="suma-username"]';
const sumaPasswordLabel = '[aria-label="suma-password"]';
const sumaEditSettingsButton =
  'h2:contains("Linux Manager") + span button:contains("Edit Settings")';
const clearSumaSettingsButton = '[aria-label="clear-suma-settings"]';
const confirmClearSumaSettings = '[aria-label="confirm-clear-suma-settings"]';
const testSumaConnectionButton = '[aria-label="test-suma-connection"]';

const sumaSettingsModal = {
  urlInput: 'label:contains("URL") + div input',
  caCertInput: 'label:contains("Certificate") + div textarea',
  removeCaCertButton: `[aria-label="remove-suma-cacert"]`,
  usernameInput: 'label:contains("Username") + div input',
  passwordInput: 'label:contains("Password") + div input',
  removePasswordButton: `[aria-label="remove-suma-password"]`,
  cancelButton: 'button:contains("Cancel")',
  saveButton: 'button:contains("Save Settings")',
};

const retentionTime = '[aria-label="retention-time"]';
const activityLogsContainer =
  'div[class*="container"]:contains("Activity Logs")';
const editActivityLogsSettingsButton = `${activityLogsContainer} button:contains("Edit Settings")`;
const activityLogSettingsModal = 'div[id*="headlessui-dialog-panel"]';
const activityLogSettingsSaveButton = `${activityLogSettingsModal} button:contains("Save Settings")`;
const activityLogSettingsCancelButton = `${activityLogSettingsModal} button:contains("Cancel")`;
const retentionTimeInput = 'input[role="spinbutton"]';

// Test data
const url = '/settings';

const sumaUrl = 'https://valid';
const sumaUsername = 'admin';
const sumaPassword = 'adminpassword';

const baseInitialSettings = {
  url: sumaUrl,
  username: sumaUsername,
  password: sumaPassword,
};

// UI Interactions

export const visit = () => {
  cy.intercept(
    'PUT',
    '/api/v1/settings/activity_log',
    cy.spy().as('changeSettingsEndpoint')
  );
  cy.intercept('/api/v1/settings/activity_log').as(
    'activityLogSettingsEndpoint'
  );
  cy.intercept('/api/v1/settings/suse_manager').as('settingsEndpoint');
  basePage.visit(url);
};

export const getCurrentRetentionTime = () =>
  cy.get(retentionTime).invoke('text');

export const clickActivityLogSettingsCancelButton = () =>
  cy.get(activityLogSettingsCancelButton).click();

export const typeRetentionTime = (amount) =>
  cy.get(retentionTimeInput).clear().type(amount);

export const clickActivityLogSettingsSaveButton = () => {
  cy.get(activityLogSettingsSaveButton).click();
};

export const clickEditActivityLogSettingsButton = () =>
  cy.get(editActivityLogsSettingsButton).click();

export const clearSumaSettings = () => {
  cy.get(clearSumaSettingsButton).click();
  cy.get(confirmClearSumaSettings).click();
};

export const clickSumaSettingsModalSaveButton = () =>
  cy.get(sumaSettingsModal.saveButton).click();

export const clickSumaEditSettingsButton = () =>
  cy.get(sumaEditSettingsButton).click();

export const clickModalCancelButton = () =>
  cy.get(sumaSettingsModal.cancelButton).click();

export const clickGenerateApiKeyButton = () =>
  cy.get(generateApiKeyButton).click();

export const setApiKeyExpiration = (amount) =>
  cy.get(apiKeyExpirationInput).type(amount);

export const clickGenerateApiKeyButtonFromModal = () =>
  cy.get(modalGenerateApiKeyButton).click();

export const clickGenerateApiKeyConfirmationButton = () =>
  cy.get(confirmationGenerateApiKeyButton).click();

export const clickModalCloseButton = () => cy.get(modalCloseButton).click();

export const interceptTestSUMASettingsRequest = (expectedStatusCode) =>
  cy.intercept('/api/v1/settings/suse_manager/test', {
    statusCode: expectedStatusCode,
  });

// UI Validations
export const changeSettingsEndpointIsNotCalled = () =>
  cy.get('@changeSettingsEndpoint').should('not.have.been.called');

export const activityLogSettingsModalIsNotDisplayed = () =>
  cy.get(activityLogSettingsModal).should('not.exist');

export const retentionTimeIsTheExpected = (expectedValue) =>
  cy.get(retentionTime).should('have.text', expectedValue);

export const showExpectedToasterAfterTestingSUMA = (expectedToasterMessage) => {
  cy.get(`p:contains("Connection ${expectedToasterMessage}!")`).should(
    'be.visible'
  );
};

export const sumaConnectionButtonIsDisabled = () =>
  cy.get(testSumaConnectionButton).should('be.disabled');

export const clickSumaConnectionTestButton = () =>
  cy.get(testSumaConnectionButton).click();

export const expectedSavingValidationsAreDisplayed = () => {
  const savingValidationScenarios = [
    {
      selector: 'missing fields',
      values: [],
      expectedErrors: [
        { selector: sumaSettingsModal.urlInput, error: 'Missing field: url' },
        { selector: sumaSettingsModal.caCertInput, error: null },
        {
          selector: sumaSettingsModal.usernameInput,
          error: 'Missing field: username',
        },
        {
          selector: sumaSettingsModal.passwordInput,
          error: 'Missing field: password',
        },
      ],
    },
    {
      selector: 'blank fields',
      values: [
        { selector: sumaSettingsModal.urlInput, value: ' ' },
        { selector: sumaSettingsModal.caCertInput, value: ' ' },
        { selector: sumaSettingsModal.usernameInput, value: ' ' },
        { selector: sumaSettingsModal.passwordInput, value: ' ' },
      ],
      expectedErrors: [
        { selector: sumaSettingsModal.urlInput, error: "Can't be blank" },
        { selector: sumaSettingsModal.caCertInput, error: "Can't be blank" },
        { selector: sumaSettingsModal.usernameInput, error: "Can't be blank" },
        { selector: sumaSettingsModal.passwordInput, error: "Can't be blank" },
      ],
    },
    {
      selector: 'invalid url and certificate',
      values: [
        { selector: sumaSettingsModal.urlInput, value: 'invalid' },
        { selector: sumaSettingsModal.caCertInput, value: 'foobar' },
        { selector: sumaSettingsModal.usernameInput, value: 'admin' },
        { selector: sumaSettingsModal.passwordInput, value: 'adminpassword' },
      ],
      expectedErrors: [
        {
          selector: sumaSettingsModal.urlInput,
          error: 'Can only be an https url',
        },
        {
          selector: sumaSettingsModal.caCertInput,
          error: 'Unable to parse x.509 certificate',
        },
      ],
    },
    {
      selector: 'http url and invalid certificate',
      values: [
        { selector: sumaSettingsModal.urlInput, value: 'http://invalid' },
        {
          selector: sumaSettingsModal.caCertInput,
          value:
            '-----BEGIN CERTIFICATE-----\nfoobar\n-----END CERTIFICATE-----',
        },
        { selector: sumaSettingsModal.usernameInput, value: 'admin' },
        { selector: sumaSettingsModal.passwordInput, value: 'adminpassword' },
      ],
      expectedErrors: [
        {
          selector: sumaSettingsModal.urlInput,
          error: 'Can only be an https url',
        },
        {
          selector: sumaSettingsModal.caCertInput,
          error: 'Unable to parse x.509 certificate',
        },
      ],
    },
    {
      selector: 'expired certificate',
      values: [
        { selector: sumaSettingsModal.urlInput, value: 'http://invalid' },
        {
          selector: sumaSettingsModal.caCertInput,
          value: expiredCertificate,
        },
        { selector: sumaSettingsModal.usernameInput, value: 'admin' },
        { selector: sumaSettingsModal.passwordInput, value: 'adminpassword' },
      ],
      expectedErrors: [
        {
          selector: sumaSettingsModal.urlInput,
          error: 'Can only be an https url',
        },
        {
          selector: sumaSettingsModal.caCertInput,
          error: 'The x.509 certificate is not valid',
        },
      ],
    },
  ];

  savingValidationScenarios.forEach(({ values, expectedErrors }) => {
    clickSumaEditSettingsButton();
    values.forEach(({ selector, value }) =>
      cy.get(selector).type(value, { delay: 0 })
    );

    clickSumaSettingsModalSaveButton();
    basePage.waitForRequest('settingsEndpoint');

    expectedErrors.forEach(({ selector, error }) => {
      const errorMessageSelector = `${selector.split('+')[0]} + div p`;
      error
        ? cy.get(errorMessageSelector).should('have.text', error)
        : cy.get(errorMessageSelector).should('not.exist');
    });
    clickModalCancelButton();
    sumaUrlHasExpectedValue('https://');
    sumaCaCertUploadDateHasExpectedValue('-');
    sumaUsernameHasExpectedValue('.....');
    sumaPasswordHasExpectedValue('.....');
  });
};

export const eachSaveSettingsScenarioWorkAsExpected = () => {
  const defaultInputValues = [
    { selector: sumaSettingsModal.urlInput, value: sumaUrl },
    { selector: sumaSettingsModal.usernameInput, value: sumaUsername },
    { selector: sumaSettingsModal.passwordInput, value: sumaPassword },
  ];

  const savingScenarios = [
    {
      values: defaultInputValues,
      expectCertUploadDate: false,
    },
    {
      values: [
        ...defaultInputValues,
        {
          selector: sumaSettingsModal.caCertInput,
          value: validCertificate,
        },
      ],
      expectCertUploadDate: true,
    },
  ];

  savingScenarios.forEach(({ values, expectCertUploadDate }) => {
    clickSumaEditSettingsButton();
    values.forEach(({ selector, value }) =>
      cy.get(selector).type(value, { delay: 0 })
    );

    clickSumaSettingsModalSaveButton();
    basePage.waitForRequest('settingsEndpoint');

    sumaUrlHasExpectedValue(sumaUrl);
    const expectedCaCertDate = expectCertUploadDate
      ? 'Certificate Uploaded'
      : '-';
    sumaCaCertUploadDateHasExpectedValue(expectedCaCertDate);
    sumaUsernameHasExpectedValue(sumaUsername);
    sumaPasswordHasExpectedValue('•••••');

    basePage.clearSUMASettings();
    basePage.refresh();
  });
};

export const editFormIsDisplayedAsExpected = () => {
  const initialEditFormScenarios = [
    {
      selector: 'without cert',
      settings: baseInitialSettings,
    },
    {
      selector: 'with certificate',
      settings: { ...baseInitialSettings, ca_cert: validCertificate },
    },
  ];

  initialEditFormScenarios.forEach(({ settings }) => {
    basePage.saveSUMASettings(settings);
    basePage.refresh();
    clickSumaEditSettingsButton();
    const { url, username, ca_cert } = settings;
    sumaUrlHasExpectedValue(url);
    if (ca_cert) {
      cy.get(sumaSettingsModal.caCertInput).should('not.exist');
      _sumaRemoveCaCertButtonIsDisplayed();
    } else {
      sumaCaCertIsEmpty();
      sumaRemoveCaCertButtonIsNotDisplayed();
    }
    cy.get(sumaSettingsModal.usernameInput).should('have.value', username);
    cy.get(sumaSettingsModal.passwordInput).should('not.exist');
    _removePasswordButtonIsDisplayed();
    clickModalCancelButton();
    basePage.clearSUMASettings();
  });
};

export const changingSettingsValidationsWorkAsExpected = () => {
  const changingValidationScenarios = [
    {
      selector: 'blank fields',
      newValues: [
        { selector: sumaSettingsModal.urlInput, value: ' ' },
        { selector: sumaSettingsModal.usernameInput, value: '   ' },
      ],
      expectedErrors: [
        { selector: sumaSettingsModal.urlInput, error: "Can't be blank" },
        { selector: sumaSettingsModal.usernameInput, error: "Can't be blank" },
      ],
    },
    {
      selector: 'invalid certificate and blank password',
      withInitialCert: true,
      changeInitialPassword: true,
      newValues: [
        {
          selector: sumaSettingsModal.caCertInput,
          value:
            '-----BEGIN CERTIFICATE-----\nfoobar\n-----END CERTIFICATE-----',
        },
        { selector: sumaSettingsModal.passwordInput, value: ' ' },
      ],
      expectedErrors: [
        {
          selector: sumaSettingsModal.caCertInput,
          error: 'Unable to parse x.509 certificate',
        },
        { selector: sumaSettingsModal.passwordInput, error: "Can't be blank" },
      ],
    },
    {
      selector: 'expired certificate and invalid url',
      withInitialCert: true,
      newValues: [
        { selector: sumaSettingsModal.urlInput, value: 'invalid' },
        {
          selector: sumaSettingsModal.caCertInput,
          value: expiredCertificate,
        },
      ],
      expectedErrors: [
        {
          selector: sumaSettingsModal.urlInput,
          error: 'Can only be an https url',
        },
        {
          selector: sumaSettingsModal.caCertInput,
          error: 'The x.509 certificate is not valid',
        },
      ],
    },
  ];

  changingValidationScenarios.forEach(
    ({
      withInitialCert = false,
      changeInitialPassword = false,
      newValues,
      expectedErrors,
    }) => {
      const initialSettings = {
        ...baseInitialSettings,
        ...(withInitialCert && { ca_cert: validCertificate }),
      };
      basePage.saveSUMASettings(initialSettings);
      basePage.refresh();
      basePage.waitForRequest('settingsEndpoint');
      clickSumaEditSettingsButton();

      if (withInitialCert) _clickRemoveSumaCaCertButton();
      if (changeInitialPassword) _clickRemovePasswordButton();

      newValues.forEach(({ selector, value }) => {
        cy.get(selector).clear().type(value, { delay: 0 });
      });

      clickSumaSettingsModalSaveButton();
      basePage.waitForRequest('settingsEndpoint');

      expectedErrors.forEach(({ selector, error }) => {
        const errorMessageSelector = `${selector.split('+')[0]} + div p`;
        error
          ? cy.get(errorMessageSelector).should('have.text', error)
          : cy.get(errorMessageSelector).should('not.exist');
      });
      clickModalCancelButton();
      sumaUrlHasExpectedValue(baseInitialSettings.url);
      const expectedSumaCaCertValue = withInitialCert
        ? 'Certificate Uploaded'
        : '-';
      sumaCaCertUploadDateHasExpectedValue(expectedSumaCaCertValue);
      sumaUsernameHasExpectedValue(baseInitialSettings.username);
      sumaPasswordHasExpectedValue('•••••');
      basePage.clearSUMASettings();
    }
  );
};

export const sumaSettingsAreCorrectlyChanged = () => {
  const newUrl = 'https://new-valid-url';
  const newUsername = 'newuser';
  const newPassword = 'newpassword';

  const changingSettingsScenarios = [
    {
      name: 'no changes applied',
      withInitialCert: true,
      newValues: [],
      expectNewUrl: false,
      expectNewUsername: false,
      expectCertUploadDate: true,
    },
    {
      name: 'changing url, username and password',
      withInitialCert: false,
      changeInitialPassword: true,
      newValues: [
        { selector: sumaSettingsModal.urlInput, value: newUrl },
        { selector: sumaSettingsModal.usernameInput, value: newUsername },
        { selector: sumaSettingsModal.passwordInput, value: newPassword },
      ],
      expectNewUrl: true,
      expectNewUsername: true,
      expectCertUploadDate: false,
    },
    {
      name: 'changing certificate',
      withInitialCert: true,
      changeInitialPassword: true,
      changeInitialCaCert: true,
      newValues: [
        { selector: sumaSettingsModal.urlInput, value: newUrl },
        { selector: sumaSettingsModal.usernameInput, value: newUsername },
        { selector: sumaSettingsModal.passwordInput, value: newPassword },
        {
          selector: sumaSettingsModal.caCertInput,
          value: anotherValidCertificate,
        },
      ],
      expectNewUrl: true,
      expectNewUsername: true,
      expectCertUploadDate: true,
    },
    {
      name: 'removing certificate',
      withInitialCert: true,
      changeInitialCaCert: true,
      expectNewUrl: false,
      expectNewUsername: false,
      expectCertUploadDate: false,
    },
  ];

  changingSettingsScenarios.forEach((scenario) => {
    const {
      withInitialCert = false,
      changeInitialPassword = false,
      changeInitialCaCert = false,
      newValues = [],
      expectNewUrl = false,
      expectNewUsername = false,
      expectCertUploadDate = false,
    } = scenario;

    const initialSettings = {
      ...baseInitialSettings,
      ...(withInitialCert && { ca_cert: validCertificate }),
    };
    basePage.saveSUMASettings(initialSettings);
    basePage.refresh();
    basePage.waitForRequest('settingsEndpoint');

    clickSumaEditSettingsButton();

    if (changeInitialCaCert) _clickRemoveSumaCaCertButton();
    if (changeInitialPassword) _clickRemovePasswordButton();

    newValues.forEach(({ selector, value }) =>
      cy.get(selector).clear().type(value, { delay: 0 })
    );

    clickSumaSettingsModalSaveButton();
    basePage.waitForRequest('settingsEndpoint');

    const expectedUrl = expectNewUrl ? newUrl : baseInitialSettings.url;
    sumaUrlHasExpectedValue(expectedUrl);

    const expectedCaCertDate = expectCertUploadDate
      ? 'Certificate Uploaded'
      : '-';
    sumaCaCertUploadDateHasExpectedValue(expectedCaCertDate);

    const expectedUsername = expectNewUsername
      ? newUsername
      : baseInitialSettings.username;
    sumaUsernameHasExpectedValue(expectedUsername);
    sumaPasswordHasExpectedValue('•••••');
    basePage.clearSUMASettings();
  });
};

export const sumaRemovePasswordButtonIsNotDisplayed = () =>
  cy.get(sumaSettingsModal.removePasswordButton).should('not.exist');

const _removePasswordButtonIsDisplayed = () =>
  cy.get(sumaSettingsModal.removePasswordButton).should('be.visible');

const _clickRemovePasswordButton = () =>
  cy.get(sumaSettingsModal.removePasswordButton).click();

const _clickRemoveSumaCaCertButton = () =>
  cy.get(sumaSettingsModal.removeCaCertButton).click();

export const sumaPasswordInputIsEmpty = () =>
  cy.get(sumaSettingsModal.passwordInput).should('have.value', '');

export const sumaUsernameInputIsEmpty = () =>
  cy.get(sumaSettingsModal.usernameInput).should('have.value', '');

export const sumaRemoveCaCertButtonIsNotDisplayed = () =>
  cy.get(sumaSettingsModal.removeCaCertButton).should('not.exist');

const _sumaRemoveCaCertButtonIsDisplayed = () =>
  cy.get(sumaSettingsModal.removeCaCertButton).should('be.visible');

export const sumaCaCertIsEmpty = () =>
  cy.get(sumaSettingsModal.caCertInput).should('have.value', '');

export const sumaUrlInputIsEmpty = () =>
  cy.get(sumaSettingsModal.urlInput).should('have.value', '');

export const sumaUsernameHasExpectedValue = (
  expectedValue = baseInitialSettings.username
) => cy.get(sumaUsernameLabel).should('have.text', expectedValue);

export const sumaPasswordHasExpectedValue = (expectedValue) =>
  cy.get(sumaPasswordLabel).should('have.text', expectedValue);

export const sumaUrlHasExpectedValue = (
  expectedValue = baseInitialSettings.url
) => cy.get(sumaUrlLabel).should('have.text', expectedValue);

export const sumaCaCertUploadDateHasExpectedValue = (
  expectedValue = 'Certificate Uploaded'
) => {
  const specificSelector = expectedValue === '-' ? '' : ' div div div';
  const selector = `${sumaCertUploadDateLabel}${specificSelector}`;
  cy.get(selector).first().should('have.text', expectedValue);
};

export const expiredApiKeyToasterIsDisplayed = () =>
  cy.get(expiredApiKeyToaster, { timeout: 15000 }).should('be.visible');

export const closeToExpireApiKeyToasterIsDisplayed = () =>
  cy.get(closeToExpireApiKeyToaster, { timeout: 15000 }).should('be.visible');

export const modalExpirationDateLabelIsDisplayed = () =>
  cy.get(modalExpirationDateLabel).should('contain', 'Key will expire');

export const modalCopyApiKeyButtonIsDisplayed = () =>
  cy.get(modalCopyApiKeyButton).should('be.visible');

export const modalShowsNewGeneratedApiKey = () =>
  cy.get(modalGeneratedApiKey).should('not.be.empty');

export const keyExpirationLabelIsDisplayed = () =>
  cy.get(keyExpirationLabel).should('be.visible');

export const apiKeyCodeIsNotEmpty = () =>
  cy.get(apiKeyCode).should('not.be.empty');

export const copyToClipboardButtonIsDisplayed = () =>
  cy.get(copyToClipboardButton).should('be.visible');

// API
export const saveDefaultSUMAsettings = () => {
  const defaultSumaSettings = {
    ...baseInitialSettings,
    ca_cert: validCertificate,
  };
  basePage.saveSUMASettings(defaultSumaSettings);
};

export const setExpiredApiKey = () =>
  updateApiKeyExpiration(subDays(new Date(), 1));

export const setCloseToExpireApiKey = () =>
  updateApiKeyExpiration(addDays(new Date(), 10));

export const updateApiKeyExpiration = (apiKeyExpiration) => {
  basePage.apiLogin().then(({ accessToken }) => {
    cy.request({
      url: '/api/v1/settings/api_key',
      method: 'PATCH',
      auth: {
        bearer: accessToken,
      },
      body: {
        expire_at: apiKeyExpiration,
      },
    });
  });
};
