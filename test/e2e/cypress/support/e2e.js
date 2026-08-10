// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

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
import { apiLoginAndCreateSession } from '../pageObject/base_po';

// Alternatively you can use CommonJS syntax:
// require('./commands')
//

// eslint-disable-next-line mocha/no-top-level-hooks
before(() => {
  Cypress.session.clearAllSavedSessions();
  if (!Cypress.expose('SSO_INTEGRATION_TESTS')) apiLoginAndCreateSession();
});
