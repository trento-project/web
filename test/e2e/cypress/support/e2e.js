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

// import 'cypress-localstorage-commands';

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')
//

// eslint-disable-next-line mocha/no-top-level-hooks
before(() => {
  Cypress.session.clearAllSavedSessions();
  if (!Cypress.env('SSO_INTEGRATION_TESTS')) {
    cy.login();
  }
});
