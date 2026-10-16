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

// TEMPORARY: diagnose sporadic loss of auth tokens under Chrome in CI.
const authDebugEvents = [];

Cypress.on('window:before:load', (win) => {
  const NativeWebSocket = win.WebSocket;
  win.WebSocket = function (...args) {
    const socket = new NativeWebSocket(...args);
    socket.addEventListener('message', (event) => {
      if (
        typeof event.data === 'string' &&
        /user_(locked|deleted|updated)/.test(event.data)
      ) {
        authDebugEvents.push(`ws(${event.data.slice(0, 200)})`);
      }
    });
    return socket;
  };
  win.WebSocket.prototype = NativeWebSocket.prototype;
  Object.assign(win.WebSocket, {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  });

  const { removeItem, clear } = win.Storage.prototype;
  win.Storage.prototype.removeItem = function (key) {
    if (this === win.localStorage && /token/.test(key)) {
      authDebugEvents.push(`removeItem(${key}) ${new Error().stack}`);
    }
    return removeItem.call(this, key);
  };
  win.Storage.prototype.clear = function () {
    if (this === win.localStorage) {
      authDebugEvents.push(`clear() ${new Error().stack}`);
    }
    return clear.call(this);
  };
});

beforeEach(() => {
  cy.intercept('/api/**', (req) => {
    req.on('response', (res) => {
      if (res.statusCode >= 400) {
        authDebugEvents.push(
          `http(${req.method} ${req.url} -> ${res.statusCode})`
        );
      }
    });
  });
});

afterEach(function () {
  cy.window({ log: false }).then((win) => {
    const hasAccess = Boolean(win.localStorage.getItem('access_token'));
    const hasRefresh = Boolean(win.localStorage.getItem('refresh_token'));
    const events = authDebugEvents.splice(0).join(' | ');
    cy.task(
      'debugLog',
      `${this.currentTest.fullTitle()} state=${this.currentTest.state} access=${hasAccess} refresh=${hasRefresh} url=${win.location.pathname} events=${events}`,
      { log: false }
    );
  });
});
