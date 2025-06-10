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
import { apiLoginAndCreateSession } from '../pageObject/base_po';

// Alternatively you can use CommonJS syntax:
// require('./commands')
//

// eslint-disable-next-line mocha/no-top-level-hooks
before(() => {
  Cypress.session.clearAllSavedSessions();
  if (!Cypress.env('SSO_INTEGRATION_TESTS')) {
    Cypress.on('uncaught:exception', (err) => {
      const appDocument = cy.state('window').document;
      // Create a highly visible container for the error message
      const errorDiv = appDocument.createElement('div');
      errorDiv.id = 'cypress-uncaught-exception-handler';
      errorDiv.style.position = 'fixed';
      errorDiv.style.top = '10px';
      errorDiv.style.left = '10px';
      errorDiv.style.padding = '10px';
      errorDiv.style.backgroundColor = 'red';
      errorDiv.style.color = 'white';
      errorDiv.style.border = '2px solid black';
      errorDiv.style.zIndex = '999999'; // Ensure it's on top of everything
      errorDiv.style.fontSize = '14px';
      errorDiv.style.fontFamily = 'monospace';
      errorDiv.style.whiteSpace = 'pre-wrap'; // Preserve formatting of the stack trace
      errorDiv.style.maxWidth = '90%';

      // Add the error message and stack trace to the div
      // Using .innerText to prevent any HTML injection issues from the error message
      errorDiv.innerText = `CYPRESS UNCAUGHT EXCEPTION:\n\n${err.stack}`;

      // Append the div to the body of the application
      appDocument.body.appendChild(errorDiv);
    });
    apiLoginAndCreateSession();
  }
});
