// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

export * from './base_po';
import * as basePage from './base_po';

import _ from 'lodash';
import { subDays, addDays } from 'date-fns';
import {
  validCertificate,
  anotherValidCertificate,
  expiredCertificate,
} from '../fixtures/smlm_credentials/certificates';

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

// SMLM selectors

const smlmUrlLabel = '[aria-label="smlm-url"]';
const smlmCertUploadDateLabel = '[aria-label="smlm-cacert-upload-date"]';
const smlmUsernameLabel = '[aria-label="smlm-username"]';
const smlmPasswordLabel = '[aria-label="smlm-password"]';
const smlmEditSettingsButton =
  'h2:contains("Linux Manager") + span button:contains("Edit Settings")';
const clearSmlmSettingsButton = '[aria-label="clear-smlm-settings"]';
const confirmClearSmlmSettings = '[aria-label="confirm-clear-smlm-settings"]';
const testSmlmConnectionButton = '[aria-label="test-smlm-connection"]';

const smlmSettingsModal = {
  urlInput: 'label:contains("URL") + div input',
  caCertInput: 'label:contains("Certificate") + div textarea',
  removeCaCertButton: `[aria-label="remove-smlm-cacert"]`,
  usernameInput: 'label:contains("Username") + div input',
  passwordInput: 'label:contains("Password") + div input',
  removePasswordButton: `[aria-label="remove-smlm-password"]`,
  cancelButton: 'button:contains("Cancel")',
  saveButton: 'button:contains("Save Settings")',
};

// Alerting selectors

const alertingEnabled = '[aria-label="alerting-enabled"]';
const alertingServer = '[aria-label="smtp-server"]';
const alertingPort = '[aria-label="smtp-port"]';
const alertingUsername = '[aria-label="smtp-username"]';
const alertingPassword = '[aria-label="smtp-password"]';
const alertingSender = '[aria-label="alerting-sender"]';
const alertingRecipient = '[aria-label="alerting-recipient"]';
const alertingEditButton = '[aria-label="alerting-edit-button"]';

const alertingEnabledEditSwitch = '#alerting-enabled-input';
const alertingServerEditField = '#smtp-server-input';
const alertingPortEditField = '#smtp-port-input';
const alertingUsernameEditField = '#smtp-username-input';
const alertingPasswordEditField =
  'input[aria-labelledby="smtp-password-label"]';
const alertingPasswordDisplayField = 'p[aria-labelledby="smtp-password-label"]';
const alertingSenderEditField = '#sender-email-input';
const alertingRecipientEditField = '#recipient-email-input';
const alertingSubmitButton = 'button[type="submit"]';

export const alertingServerInputError =
  '[aria-label="smtp-server-input-error"]';
export const alertingPortInputError = '[aria-label="smtp-port-input-error"]';
export const alertingUsernameInputError =
  '[aria-label="smtp-username-input-error"]';
export const alertingPasswordInputError =
  '[aria-label="smtp-password-input-error"]';
export const alertingSenderInputError =
  '[aria-label="sender-email-input-error"]';
export const alertingRecipientInputError =
  '[aria-label="recipient-email-input-error"]';

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

const smlmUrl = 'https://valid';
const smlmUsername = 'admin';
const smlmPassword = 'adminpassword';

const baseInitialSettings = {
  url: smlmUrl,
  username: smlmUsername,
  password: smlmPassword,
};

const alertingDevEnvSettings = {
  enabled: true,
  smtpServer: 'localhost',
  smtpPort: '1025',
  smtpUsername: 'trentouser',
  senderEmail: 'alerts@trento-project.io',
  recipientEmail: 'admin@trento-project.io',
};

const alertingPlaceholderSettings = {
  enabled: false,
  smtpServer: 'https://.....',
  smtpPort: 587,
  smtpUsername: '.....',
  senderEmail: '...@...',
  recipientEmail: '...@...',
};

const alertingInitialSettings = {
  enabled: true,
  smtpServer: 'https://test-smtp-server.com',
  smtpPort: 587,
  smtpUsername: 'testuser',
  smtpPassword: 'testpass',
  senderEmail: 'adm@trento-project.io',
  recipientEmail: 'rcv@trento-project.io',
};

const alertingUpdateSettings = {
  enabled: true,
  smtpServer: 'https://test2-smtp-server.com',
  smtpPort: 588,
  smtpUsername: 'testuser2',
  smtpPassword: 'testpass2',
  senderEmail: 'adm2@trento-project.io',
  recipientEmail: 'rcv2@trento-project.io',
};

export const alertingErrorScenarios = [
  {
    name: 'values are not provided',
    valueConf: {
      values: {},
      removePasswordProtection: false,
    },
    errorConf: [
      {
        selector: alertingServerInputError,
        error: 'Missing field: smtp_server',
      },
      {
        selector: alertingPortInputError,
        error: 'Missing field: smtp_port',
      },
      {
        selector: alertingUsernameInputError,
        error: 'Missing field: smtp_username',
      },
      {
        selector: alertingPasswordInputError,
        error: 'Missing field: smtp_password',
      },
      {
        selector: alertingSenderInputError,
        error: 'Missing field: sender_email',
      },
      {
        selector: alertingRecipientInputError,
        error: 'Missing field: recipient_email',
      },
    ],
  },
];

// UI Interactions

export const visit = () => {
  cy.intercept(
    'PUT',
    '/api/v1/settings/activity_log',
    cy.spy().as('changeSettingsEndpoint')
  );
  interceptSettingsPageEndpoints();
  return basePage.visit(url);
};

export const getCurrentRetentionTime = () =>
  cy.get(retentionTime).invoke('text');

export const clickActivityLogSettingsCancelButton = () =>
  cy.get(activityLogSettingsCancelButton).click();

export const typeRetentionTime = (amount) =>
  cy.get(retentionTimeInput).clear().type(amount);

export const clickActivityLogSettingsSaveButton = () =>
  cy.get(activityLogSettingsSaveButton).click();

export const clickEditActivityLogSettingsButton = () =>
  cy.get(editActivityLogsSettingsButton).click();

export const clearSmlmSettings = () => {
  cy.get(clearSmlmSettingsButton).click();
  return cy.get(confirmClearSmlmSettings).click();
};

export const clickSmlmSettingsModalSaveButton = () =>
  cy.get(smlmSettingsModal.saveButton).click();

export const clickSmlmEditSettingsButton = () =>
  cy.get(smlmEditSettingsButton).click();

export const clickModalCancelButton = () =>
  cy.get(smlmSettingsModal.cancelButton).click();

export const clickGenerateApiKeyButton = () =>
  cy.get(generateApiKeyButton).click();

export const clickAlertingEditButton = () => cy.get(alertingEditButton).click();

const getAlertingRemovePasswordButton = () =>
  cy.get('button').contains('Remove');

export const removeAlertringPasswordProtection = () =>
  getAlertingRemovePasswordButton().click();

export const setAlertingEnabledEditSwitch = (value) =>
  cy
    .get(alertingEnabledEditSwitch)
    .invoke('attr', 'aria-checked')
    .then((checked) => {
      const currentlyChecked = checked == 'true';
      if (currentlyChecked == value) return;
      return cy.get(alertingEnabledEditSwitch).click();
    });

export const generateApiKeyButtonIsEnabled = () =>
  cy.get(generateApiKeyButton).should('be.visible').and('be.enabled');

export const generateApiKeyButtonIsDisabled = () =>
  cy
    .get(generateApiKeyButton)
    .should('have.class', 'opacity-50')
    .and('be.disabled');

export const setApiKeyExpiration = (amount) =>
  cy.get(apiKeyExpirationInput).type(amount);

export const clickGenerateApiKeyButtonFromModal = () =>
  cy.get(modalGenerateApiKeyButton).click();

export const clickGenerateApiKeyConfirmationButton = () =>
  cy.get(confirmationGenerateApiKeyButton).click();

export const clickModalCloseButton = () => cy.get(modalCloseButton).click();

export const interceptTestSMLMSettingsRequest = (expectedStatusCode) =>
  cy.intercept('/api/v1/settings/suse_manager/test', {
    statusCode: expectedStatusCode,
  });

export const clickSmlmConnectionTestButton = () =>
  cy.get(testSmlmConnectionButton).click();

const _clickRemovePasswordButton = () =>
  cy.get(smlmSettingsModal.removePasswordButton).click();

const _clickRemoveSmlmCaCertButton = () =>
  cy.get(smlmSettingsModal.removeCaCertButton).click();

const typeAlertingServer = (text) =>
  cy.get(alertingServerEditField).clear().type(text);
const typeAlertingPort = (text) =>
  cy.get(alertingPortEditField).clear().type(text);
const typeAlertingUsername = (text) =>
  cy.get(alertingUsernameEditField).clear().type(text);
const typeAlertingPassword = (text) =>
  cy.get(alertingPasswordEditField).clear().type(text);
const typeAlertingSender = (text) =>
  cy.get(alertingSenderEditField).clear().type(text);
const typeAlertingRecipient = (text) =>
  cy.get(alertingRecipientEditField).clear().type(text);
const submitAlertingSettings = () => cy.get(alertingSubmitButton).click();

export const enterAlertingSettings = (
  {
    enabled,
    smtpServer,
    smtpPort,
    smtpUsername,
    smtpPassword,
    senderEmail,
    recipientEmail,
  },
  removePasswordProtection
) => {
  if (enabled) setAlertingEnabledEditSwitch(enabled);
  if (smtpServer) typeAlertingServer(smtpServer);
  if (smtpPort) typeAlertingPort(smtpPort);
  if (smtpUsername) typeAlertingUsername(smtpUsername);
  if (removePasswordProtection) removeAlertringPasswordProtection();
  if (smtpPassword) typeAlertingPassword(smtpPassword);
  if (senderEmail) typeAlertingSender(senderEmail);
  if (recipientEmail) typeAlertingRecipient(recipientEmail);

  submitAlertingSettings();
  return basePage.waitForRequest('alertingSettingsEndpoint');
};

export const enterAlertingInitialSettings = () =>
  enterAlertingSettings(alertingInitialSettings, false);

export const enterAlertingUpdateSettingsWithoutPassword = () =>
  enterAlertingSettings(
    _.pick(alertingUpdateSettings, [
      'enabled',
      'smtpServer',
      'smtpPort',
      'smtpUsername',
      'senderEmail',
      'recipientEmail',
    ]),
    false
  );

export const enterAlertingUpdateSettingsWithPassword = () =>
  enterAlertingSettings(alertingUpdateSettings, true);

export const interceptSettingsPageEndpoints = () => {
  cy.intercept('/api/v1/settings/api_key').as('apiKeySettingsEndpoint');
  cy.intercept('/api/v1/settings/activity_log').as(
    'activityLogSettingsEndpoint'
  );
  cy.intercept('/api/v1/settings/suse_manager').as('smlmSettingsEndpoint');
  return cy
    .intercept('/api/v1/settings/alerting')
    .as('alertingSettingsEndpoint');
};

export const waitForSettingsPageRequests = () => {
  basePage.waitForRequest('apiKeySettingsEndpoint');
  // need to wait twice for api key as it is loaded in the initial fetch as well
  basePage.waitForRequest('apiKeySettingsEndpoint');
  basePage.waitForRequest('activityLogSettingsEndpoint');
  basePage.waitForRequest('smlmSettingsEndpoint');
  return basePage.waitForRequest('alertingSettingsEndpoint');
};

export const checkSettingsEndpointsRequestsAreForbidden = (forbidden) => {
  const matcher = forbidden ? 'eq' : 'not.eq';
  const waitOptions = { retryUnauthorized: false };

  basePage
    .waitForRequest('apiKeySettingsEndpoint', waitOptions)
    .its('response.statusCode')
    .should(matcher, 401);
  basePage
    .waitForRequest('activityLogSettingsEndpoint', waitOptions)
    .its('response.statusCode')
    .should(matcher, 401);
  basePage
    .waitForRequest('smlmSettingsEndpoint', waitOptions)
    .its('response.statusCode')
    .should(matcher, 401);
  return basePage
    .waitForRequest('alertingSettingsEndpoint', waitOptions)
    .its('response.statusCode')
    .should(matcher, 401);
};

// UI Validations

export const activityLogsEditButtonIsEnabled = () =>
  cy.get(editActivityLogsSettingsButton).should('be.enabled');

export const activityLogsEditButtonIsDisabled = () =>
  cy.get(editActivityLogsSettingsButton).should('be.disabled');

export const smlmClearSettingsButtonIsEnabled = () =>
  cy.get(clearSmlmSettingsButton).should('be.enabled');

export const smlmClearSettingsButtonIsDisabled = () =>
  cy.get(clearSmlmSettingsButton).should('be.disabled');

export const smlmEditSettingsButtonIsEnabled = () =>
  cy.get(smlmEditSettingsButton).should('be.enabled');

export const smlmEditSettingsButtonIsDisabled = () =>
  cy.get(smlmEditSettingsButton).should('be.disabled');

export const smlmConnectionTestButtonIsEnabled = () =>
  cy.get(testSmlmConnectionButton).should('be.enabled');

export const changeSettingsEndpointIsNotCalled = () =>
  cy.get('@changeSettingsEndpoint').should('not.have.been.called');

export const activityLogSettingsModalIsNotDisplayed = () =>
  cy.get(activityLogSettingsModal).should('not.exist');

export const retentionTimeIsTheExpected = (expectedValue) =>
  cy.get(retentionTime).should('have.text', expectedValue);

export const showExpectedToasterAfterTestingSMLM = (expectedToasterMessage) =>
  cy
    .get(`p:contains("Connection ${expectedToasterMessage}!")`)
    .should('be.visible');

export const smlmConnectionButtonIsDisabled = () =>
  cy.get(testSmlmConnectionButton).should('be.disabled');

export const expectedSavingValidationsAreDisplayed = () => {
  const savingValidationScenarios = [
    {
      selector: 'missing fields',
      values: [],
      expectedErrors: [
        { selector: smlmSettingsModal.urlInput, error: 'Missing field: url' },
        { selector: smlmSettingsModal.caCertInput, error: null },
        {
          selector: smlmSettingsModal.usernameInput,
          error: 'Missing field: username',
        },
        {
          selector: smlmSettingsModal.passwordInput,
          error: 'Missing field: password',
        },
      ],
    },
    {
      selector: 'blank fields',
      values: [
        { selector: smlmSettingsModal.urlInput, value: ' ' },
        { selector: smlmSettingsModal.caCertInput, value: ' ' },
        { selector: smlmSettingsModal.usernameInput, value: ' ' },
        { selector: smlmSettingsModal.passwordInput, value: ' ' },
      ],
      expectedErrors: [
        { selector: smlmSettingsModal.urlInput, error: "Can't be blank" },
        { selector: smlmSettingsModal.caCertInput, error: "Can't be blank" },
        { selector: smlmSettingsModal.usernameInput, error: "Can't be blank" },
        { selector: smlmSettingsModal.passwordInput, error: "Can't be blank" },
      ],
    },
    {
      selector: 'invalid url and certificate',
      values: [
        { selector: smlmSettingsModal.urlInput, value: 'invalid' },
        { selector: smlmSettingsModal.caCertInput, value: 'foobar' },
        { selector: smlmSettingsModal.usernameInput, value: 'admin' },
        { selector: smlmSettingsModal.passwordInput, value: 'adminpassword' },
      ],
      expectedErrors: [
        {
          selector: smlmSettingsModal.urlInput,
          error: 'Can only be an https url',
        },
        {
          selector: smlmSettingsModal.caCertInput,
          error: 'Unable to parse x.509 certificate',
        },
      ],
    },
    {
      selector: 'http url and invalid certificate',
      values: [
        { selector: smlmSettingsModal.urlInput, value: 'http://invalid' },
        {
          selector: smlmSettingsModal.caCertInput,
          value:
            '-----BEGIN CERTIFICATE-----\nfoobar\n-----END CERTIFICATE-----',
        },
        { selector: smlmSettingsModal.usernameInput, value: 'admin' },
        { selector: smlmSettingsModal.passwordInput, value: 'adminpassword' },
      ],
      expectedErrors: [
        {
          selector: smlmSettingsModal.urlInput,
          error: 'Can only be an https url',
        },
        {
          selector: smlmSettingsModal.caCertInput,
          error: 'Unable to parse x.509 certificate',
        },
      ],
    },
    {
      selector: 'expired certificate',
      values: [
        { selector: smlmSettingsModal.urlInput, value: 'http://invalid' },
        {
          selector: smlmSettingsModal.caCertInput,
          value: expiredCertificate,
        },
        { selector: smlmSettingsModal.usernameInput, value: 'admin' },
        { selector: smlmSettingsModal.passwordInput, value: 'adminpassword' },
      ],
      expectedErrors: [
        {
          selector: smlmSettingsModal.urlInput,
          error: 'Can only be an https url',
        },
        {
          selector: smlmSettingsModal.caCertInput,
          error: 'The x.509 certificate is not valid',
        },
      ],
    },
  ];

  return cy
    .wrap(savingValidationScenarios)
    .each(({ values, expectedErrors }) => {
      clickSmlmEditSettingsButton();
      cy.wrap(values).each(({ selector, value }) =>
        cy.get(selector).type(value, { delay: 0 })
      );

      clickSmlmSettingsModalSaveButton();
      basePage.waitForRequest('smlmSettingsEndpoint');

      cy.wrap(expectedErrors).each(({ selector, error }) => {
        const errorMessageSelector = `${selector.split('+')[0]} + div p`;
        error
          ? cy.get(errorMessageSelector).should('have.text', error)
          : cy.get(errorMessageSelector).should('not.exist');
      });
      clickModalCancelButton();
      smlmUrlHasExpectedValue('https://');
      smlmCaCertUploadDateHasExpectedValue('-');
      smlmUsernameHasExpectedValue('.....');
      smlmPasswordHasExpectedValue('.....');
    });
};

export const eachSaveSettingsScenarioWorkAsExpected = () => {
  const defaultInputValues = [
    { selector: smlmSettingsModal.urlInput, value: smlmUrl },
    { selector: smlmSettingsModal.usernameInput, value: smlmUsername },
    { selector: smlmSettingsModal.passwordInput, value: smlmPassword },
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
          selector: smlmSettingsModal.caCertInput,
          value: validCertificate,
        },
      ],
      expectCertUploadDate: true,
    },
  ];

  return cy.wrap(savingScenarios).each(({ values, expectCertUploadDate }) => {
    clickSmlmEditSettingsButton();
    cy.wrap(values).each(({ selector, value }) =>
      cy.get(selector).type(value, { delay: 0 })
    );

    clickSmlmSettingsModalSaveButton();
    basePage.waitForRequest('smlmSettingsEndpoint');

    smlmUrlHasExpectedValue(smlmUrl);
    const expectedCaCertDate = expectCertUploadDate
      ? 'Certificate Uploaded'
      : '-';
    smlmCaCertUploadDateHasExpectedValue(expectedCaCertDate);
    smlmUsernameHasExpectedValue(smlmUsername);
    smlmPasswordHasExpectedValue('•••••');

    basePage.clearSMLMSettings();
    return basePage.refresh();
  });
};

export const editFormIsDisplayedAsExpected = () => {
  const initialEditFormScenarios = [
    {
      scenario: 'without cert',
      settings: baseInitialSettings,
    },
    {
      scenario: 'with certificate',
      settings: { ...baseInitialSettings, ca_cert: validCertificate },
    },
  ];

  return cy.wrap(initialEditFormScenarios).each(({ settings }) => {
    basePage.saveSMLMSettings(settings);
    basePage.refresh();
    clickSmlmEditSettingsButton();
    const { url, username, ca_cert } = settings;
    smlmUrlHasExpectedValue(url);
    if (ca_cert) {
      cy.get(smlmSettingsModal.caCertInput).should('not.exist');
      _smlmRemoveCaCertButtonIsDisplayed();
    } else {
      smlmCaCertIsEmpty();
      smlmRemoveCaCertButtonIsNotDisplayed();
    }
    cy.get(smlmSettingsModal.usernameInput).should('have.value', username);
    cy.get(smlmSettingsModal.passwordInput).should('not.exist');
    _removePasswordButtonIsDisplayed();
    clickModalCancelButton();
    return basePage.clearSMLMSettings();
  });
};

export const changingSettingsValidationsWorkAsExpected = () => {
  const changingValidationScenarios = [
    {
      selector: 'blank fields',
      newValues: [
        { selector: smlmSettingsModal.urlInput, value: ' ' },
        { selector: smlmSettingsModal.usernameInput, value: '   ' },
      ],
      expectedErrors: [
        { selector: smlmSettingsModal.urlInput, error: "Can't be blank" },
        { selector: smlmSettingsModal.usernameInput, error: "Can't be blank" },
      ],
    },
    {
      selector: 'invalid certificate and blank password',
      withInitialCert: true,
      changeInitialPassword: true,
      newValues: [
        {
          selector: smlmSettingsModal.caCertInput,
          value:
            '-----BEGIN CERTIFICATE-----\nfoobar\n-----END CERTIFICATE-----',
        },
        { selector: smlmSettingsModal.passwordInput, value: ' ' },
      ],
      expectedErrors: [
        {
          selector: smlmSettingsModal.caCertInput,
          error: 'Unable to parse x.509 certificate',
        },
        { selector: smlmSettingsModal.passwordInput, error: "Can't be blank" },
      ],
    },
    {
      selector: 'expired certificate and invalid url',
      withInitialCert: true,
      newValues: [
        { selector: smlmSettingsModal.urlInput, value: 'invalid' },
        {
          selector: smlmSettingsModal.caCertInput,
          value: expiredCertificate,
        },
      ],
      expectedErrors: [
        {
          selector: smlmSettingsModal.urlInput,
          error: 'Can only be an https url',
        },
        {
          selector: smlmSettingsModal.caCertInput,
          error: 'The x.509 certificate is not valid',
        },
      ],
    },
  ];

  return cy
    .wrap(changingValidationScenarios)
    .each(
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
        basePage.saveSMLMSettings(initialSettings);
        basePage.refresh();
        basePage.waitForRequest('smlmSettingsEndpoint');
        clickSmlmEditSettingsButton();

        if (withInitialCert) _clickRemoveSmlmCaCertButton();
        if (changeInitialPassword) _clickRemovePasswordButton();

        cy.wrap(newValues).each(({ selector, value }) =>
          cy.get(selector).clear().type(value, { delay: 0 })
        );

        clickSmlmSettingsModalSaveButton();
        basePage.waitForRequest('smlmSettingsEndpoint');

        cy.wrap(expectedErrors).each(({ selector, error }) => {
          const errorMessageSelector = `${selector.split('+')[0]} + div p`;
          error
            ? cy.get(errorMessageSelector).should('have.text', error)
            : cy.get(errorMessageSelector).should('not.exist');
        });
        clickModalCancelButton();
        smlmUrlHasExpectedValue(baseInitialSettings.url);
        const expectedSmlmCaCertValue = withInitialCert
          ? 'Certificate Uploaded'
          : '-';
        smlmCaCertUploadDateHasExpectedValue(expectedSmlmCaCertValue);
        smlmUsernameHasExpectedValue(baseInitialSettings.username);
        smlmPasswordHasExpectedValue('•••••');
        return basePage.clearSMLMSettings();
      }
    );
};

export const smlmSettingsAreCorrectlyChanged = () => {
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
        { selector: smlmSettingsModal.urlInput, value: newUrl },
        { selector: smlmSettingsModal.usernameInput, value: newUsername },
        { selector: smlmSettingsModal.passwordInput, value: newPassword },
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
        { selector: smlmSettingsModal.urlInput, value: newUrl },
        { selector: smlmSettingsModal.usernameInput, value: newUsername },
        { selector: smlmSettingsModal.passwordInput, value: newPassword },
        {
          selector: smlmSettingsModal.caCertInput,
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

  return cy.wrap(changingSettingsScenarios).each((scenario) => {
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
    basePage.saveSMLMSettings(initialSettings);
    basePage.refresh();
    basePage.waitForRequest('smlmSettingsEndpoint');

    clickSmlmEditSettingsButton();

    if (changeInitialCaCert) _clickRemoveSmlmCaCertButton();
    if (changeInitialPassword) _clickRemovePasswordButton();

    cy.wrap(newValues).each(({ selector, value }) =>
      cy.get(selector).clear().type(value, { delay: 0 })
    );

    clickSmlmSettingsModalSaveButton();
    basePage.waitForRequest('smlmSettingsEndpoint');

    const expectedUrl = expectNewUrl ? newUrl : baseInitialSettings.url;
    smlmUrlHasExpectedValue(expectedUrl);

    const expectedCaCertDate = expectCertUploadDate
      ? 'Certificate Uploaded'
      : '-';
    smlmCaCertUploadDateHasExpectedValue(expectedCaCertDate);

    const expectedUsername = expectNewUsername
      ? newUsername
      : baseInitialSettings.username;
    smlmUsernameHasExpectedValue(expectedUsername);
    smlmPasswordHasExpectedValue('•••••');
    return basePage.clearSMLMSettings();
  });
};

export const smlmRemovePasswordButtonIsNotDisplayed = () =>
  cy.get(smlmSettingsModal.removePasswordButton).should('not.exist');

const _removePasswordButtonIsDisplayed = () =>
  cy.get(smlmSettingsModal.removePasswordButton).should('be.visible');

export const smlmPasswordInputIsEmpty = () =>
  cy.get(smlmSettingsModal.passwordInput).should('have.value', '');

export const smlmUsernameInputIsEmpty = () =>
  cy.get(smlmSettingsModal.usernameInput).should('have.value', '');

export const smlmRemoveCaCertButtonIsNotDisplayed = () =>
  cy.get(smlmSettingsModal.removeCaCertButton).should('not.exist');

const _smlmRemoveCaCertButtonIsDisplayed = () =>
  cy.get(smlmSettingsModal.removeCaCertButton).should('be.visible');

export const smlmCaCertIsEmpty = () =>
  cy.get(smlmSettingsModal.caCertInput).should('have.value', '');

export const smlmUrlInputIsEmpty = () =>
  cy.get(smlmSettingsModal.urlInput).should('have.value', '');

export const smlmUsernameHasExpectedValue = (
  expectedValue = baseInitialSettings.username
) => cy.get(smlmUsernameLabel).should('have.text', expectedValue);

export const smlmPasswordHasExpectedValue = (expectedValue) =>
  cy.get(smlmPasswordLabel).should('have.text', expectedValue);

export const smlmUrlHasExpectedValue = (
  expectedValue = baseInitialSettings.url
) => cy.get(smlmUrlLabel).should('have.text', expectedValue);

export const smlmCaCertUploadDateHasExpectedValue = (
  expectedValue = 'Certificate Uploaded'
) => {
  const specificSelector = expectedValue === '-' ? '' : ' div div div';
  const selector = `${smlmCertUploadDateLabel}${specificSelector}`;
  return cy.get(selector).first().should('have.text', expectedValue);
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

export const showExpectedErrors = (errConfig) =>
  cy
    .wrap(errConfig)
    .each(({ selector, error }) => cy.get(selector).should('have.text', error));

const alertingConfigDisplaysSettings = ({
  enabled,
  smtpServer,
  smtpPort,
  smtpUsername,
  senderEmail,
  recipientEmail,
}) => {
  cy.get(alertingEnabled).should('have.text', enabled ? 'Enabled' : 'Disabled');
  cy.get(alertingServer).should('have.text', smtpServer);
  cy.get(alertingPort).should('have.text', String(smtpPort));
  cy.get(alertingUsername).should('have.text', smtpUsername);
  cy.get(alertingPassword).should('have.text', '•••••');
  cy.get(alertingSender).should('have.text', senderEmail);
  return cy.get(alertingRecipient).should('have.text', recipientEmail);
};

export const alertingConfigDisplaysDevEnvValues = () =>
  alertingConfigDisplaysSettings(alertingDevEnvSettings);

export const alertingConfigDisplaysPlaceholderValues = () =>
  alertingConfigDisplaysSettings(alertingPlaceholderSettings);

export const alertingConfigDisplaysInitialValues = () =>
  alertingConfigDisplaysSettings(alertingInitialSettings);

export const alertingConfigDisplaysUpdateValues = () =>
  alertingConfigDisplaysSettings(alertingUpdateSettings);

export const alertingEditButtonIsEnabled = () =>
  cy.get(alertingEditButton).should('be.enabled');

export const alertingEditButtonIsDisabled = () =>
  cy.get(alertingEditButton).should('be.disabled');

const alertingRemovePasswordButtonNotExist = () => {
  getAlertingRemovePasswordButton().should('not.exist');
};

const alertingRemovePasswordButtonIsVisible = () => {
  getAlertingRemovePasswordButton().should('be.visible');
};

export const alertingEditFormDisplaysEmptyFields = () => {
  cy.get(alertingEnabledEditSwitch).should(
    'have.attr',
    'aria-checked',
    'false'
  );
  cy.get(alertingServerEditField).should('have.value', '');
  cy.get(alertingPortEditField).should('have.value', '');
  cy.get(alertingUsernameEditField).should('have.value', '');
  cy.get(alertingPasswordEditField).should('have.value', '');
  cy.get(alertingPasswordDisplayField).should('not.exist');
  alertingRemovePasswordButtonNotExist();
  cy.get(alertingSenderEditField).should('have.value', '');
  return cy.get(alertingRecipientEditField).should('have.value', '');
};

const alertingEditFormDisplaysSettings = ({
  enabled,
  smtpServer,
  smtpPort,
  smtpUsername,
  senderEmail,
  recipientEmail,
}) => {
  cy.get(alertingEnabledEditSwitch).should(
    'have.attr',
    'aria-checked',
    enabled ? 'true' : 'false'
  );
  cy.get(alertingServerEditField).should('have.value', smtpServer);
  cy.get(alertingPortEditField).should('have.value', String(smtpPort));
  cy.get(alertingUsernameEditField).should('have.value', smtpUsername);
  cy.get(alertingPasswordEditField).should('not.exist');
  cy.get(alertingPasswordDisplayField).should('have.text', '•••••');
  alertingRemovePasswordButtonIsVisible();
  cy.get(alertingSenderEditField).should('have.value', senderEmail);
  return cy
    .get(alertingRecipientEditField)
    .should('have.value', recipientEmail);
};

export const alertingEditFormDisplaysInitialSettings = () =>
  alertingEditFormDisplaysSettings(alertingInitialSettings);

// API

export const saveDefaultSMLMSettings = () => {
  const defaultSmlmSettings = {
    ...baseInitialSettings,
    ca_cert: validCertificate,
  };
  return basePage.saveSMLMSettings(defaultSmlmSettings);
};

export const setExpiredApiKey = () =>
  updateApiKeyExpiration(subDays(new Date(), 1));

export const setCloseToExpireApiKey = () =>
  updateApiKeyExpiration(addDays(new Date(), 10));

export const updateApiKeyExpiration = (apiKeyExpiration) =>
  basePage.apiLogin().then(({ accessToken }) =>
    cy.request({
      url: '/api/v1/settings/api_key',
      method: 'PATCH',
      auth: {
        bearer: accessToken,
      },
      body: {
        expire_at: apiKeyExpiration,
      },
    })
  );

export const resetAlertingSettingsDB = () =>
  cy.exec(
    `cd ${Cypress.expose('project_root')} && mix clear_alerting_settings`
  );

export const saveInitialAlertingSettings = () =>
  basePage.apiLogin().then(({ accessToken }) =>
    cy.request({
      url: '/api/v1/settings/alerting',
      method: 'POST',
      auth: {
        bearer: accessToken,
      },
      body: {
        enabled: alertingInitialSettings.enabled,
        smtp_server: alertingInitialSettings.smtpServer,
        smtp_port: alertingInitialSettings.smtpPort,
        smtp_username: alertingInitialSettings.smtpUsername,
        smtp_password: alertingInitialSettings.smtpPassword,
        sender_email: alertingInitialSettings.senderEmail,
        recipient_email: alertingInitialSettings.recipientEmail,
      },
    })
  );

export const apiCreateUserWithSettingsAbilities = () =>
  basePage.apiCreateUserWithAbilities([
    { name: 'all', resource: 'activity_logs_settings' },
    { name: 'all', resource: 'api_key_settings' },
    { name: 'all', resource: 'suma_settings' },
    { name: 'all', resource: 'alerting_settings' },
  ]);
