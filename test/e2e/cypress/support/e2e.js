// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Enable Testing Library plugin for Cypress
import '@testing-library/cypress/add-commands';

// Import commands.js using ES2015 syntax:
import {
  apiLoginAndCreateSession,
  apiAcceptAnalyticsEula,
  getLoginCredentials,
} from '../pageObject/base_po';

// Alternatively you can use CommonJS syntax:
// require('./commands')
//

before(() => {
  Cypress.session.clearAllSavedSessions();
  if (!Cypress.expose('SSO_INTEGRATION_TESTS')) {
    apiLoginAndCreateSession();
    getLoginCredentials().then(({ username, password }) =>
      apiAcceptAnalyticsEula(username, password)
    );
  }
});

// Chrome aborts in-flight XHRs when a test navigates away (e.g. click link +
// go back); the app surfaces this as an unhandled Axios rejection that would
// fail an otherwise correct test.
Cypress.on('uncaught:exception', (err) => {
  const isAbortedRequest =
    err.name === 'AxiosError' && err.message.includes('Request aborted');
  return !isAbortedRequest;
});
