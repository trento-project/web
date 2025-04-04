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
