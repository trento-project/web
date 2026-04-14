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

// Import commands.js using ES2015 syntax:
import {
  apiLoginAndCreateSession,
  apiDeregisterRealHost,
} from '../pageObject/base_po';

// Alternatively you can use CommonJS syntax:
// require('./commands')
//

// eslint-disable-next-line mocha/no-top-level-hooks
before(() => {
  Cypress.session.clearAllSavedSessions();
  if (!Cypress.env('SSO_INTEGRATION_TESTS')) {
    apiLoginAndCreateSession();
  }

  // This is required to not break cypress tests when running against a real systemd instance (which installs a real agent)
  if (Cypress.config().baseUrl.includes('target')) apiDeregisterRealHost();
});


// This is needed because requests that depend on Prometheus in a real environment return a 500 in SLES16, this can be removed once TRNT-4344 is done.
Cypress.on('uncaught:exception', () => {
  if (Cypress.config().baseUrl.includes('target16sp0')) return false;
});
