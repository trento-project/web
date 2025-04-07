export * from './base_po.js';
import * as basePage from './base_po.js';

import { subDays, addDays } from 'date-fns';
import {
  validCertificate,
  anotherValidCertificate,
  expiredCertificate,
} from '../fixtures/suma_credentials/certificates';
import { createUserRequestFactory } from '@lib/test-utils/factories';

// Test data
const url = '/settings';

const sumaSettings = {
  URL_INPUT: 'suma-url-input',
  CA_CERT_INPUT: 'suma-cacert-input',
  USERNAME_INPUT: 'suma-username-input',
  PASSWORD_INPUT: 'suma-password-input',

  sumaUrl: 'https://valid',
  sumaUsername: 'admin',
  sumaPassword: 'adminpassword',
};

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

// UI Interactions

export const visit = () => cy.visit(url);

export const clickModalCloseButton = () => cy.get(modalCloseButton).click();

export const clickGenerateApiKeyButton = () =>
  cy.get(generateApiKeyButton).click();

export const setApiKeyExpiration = (amount) =>
  cy.get(apiKeyExpirationInput).type(amount);

export const clickGenerateApiKeyButtonFromModal = () =>
  cy.get(modalGenerateApiKeyButton).click();

export const clickGenerateApiKeyConfirmationButton = () =>
  cy.get(confirmationGenerateApiKeyButton).click();

// UI Validations
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
