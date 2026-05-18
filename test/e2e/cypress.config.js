// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

const { defineConfig } = require('cypress');

const DEMO = 'demo';
const DEV = 'dev';

// Whitelist of environment variables allowed to override 'expose' configuration
const PUBLIC_CONFIG_KEYS = [
  'ALERTING_DB_TESTS',
  'ALERTING_TESTS',
  'REAL_CLUSTER_TESTS',
  'SSO_INTEGRATION_TESTS',
  'SSO_TYPE',
  'idp_url',
  'photofinish_binary',
  'project_root',
  'wandaUrl',
  'wanda_mode',
  'web_mode',
];

// Filters Cypress.env to only include allowed keys from the whitelist
const getPublicEnvOverrides = (env = {}) => {
  const overrides = {};

  PUBLIC_CONFIG_KEYS.forEach((key) => {
    if (env[key] !== undefined) overrides[key] = env[key];
  });

  return overrides;
};

// Merges default 'expose' config with environment overrides (overrides take precedence)
const exposePublicConfig = (config) => ({
  ...config.expose,
  ...getPublicEnvOverrides(config.env),
});

const calculateWandaUrl = (config) => {
  const { wandaUrl, wanda_mode: wandaMode } = config.expose;

  if (wandaUrl) return wandaUrl;
  return wandaMode === DEMO
    ? 'http://localhost:4001'
    : `${config.baseUrl}/wanda`;
};

module.exports = defineConfig({
  allowCypressEnv: false,
  viewportWidth: 1366,
  viewportHeight: 768,
  defaultCommandTimeout: 10000,
  // Default public configuration (can be overridden by environment variables)
  expose: {
    project_root: '../..',
    photofinish_binary: 'photofinish',
    idp_url: 'http://localhost:8081',
    wanda_mode: DEMO, //demo: local dev instance with, docker compose with wanda profile / prod: instance installed via rpm
    web_mode: DEV, //dev: local dev instance / prod: instance installed via rpm
  },
  // Internal Cypress environment variables (not exposed by default)
  env: {
    heartbeat_interval: 5000,
    login_user: 'admin',
    login_password: 'adminpassword',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    async setupNodeEvents(on, config) {
      config.expose = exposePublicConfig(config);
      config.expose.wandaUrl = calculateWandaUrl(config);
      return require('./cypress/plugins/index.js')(on, config);
    },
    testIsolation: false,
    baseUrl: 'http://localhost:4000',
  },
});
