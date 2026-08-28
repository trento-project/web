// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

const { defineConfig } = require('cypress');

const DEMO = 'demo';
const DEV = 'dev';
const PROD = 'prod';

// A remote target is an instance reached over a network with real latency,
// as opposed to a local dev instance. Timings that are comfortable against
// localhost need more slack there.
const isRemoteTarget = (config) => config.expose.web_mode === PROD;

// The server expires a heartbeat after
// `interval * (allowed_missed + 1) + tolerance`, which with the product
// defaults is 6 seconds. Sending every 5 seconds leaves a single second of
// margin, not enough for a remote target: one late heartbeat flips the host
// to unhealthy. Sending more often means three consecutive heartbeats must be
// lost before the host expires.
const LOCAL_HEARTBEAT_INTERVAL = 5000;
const REMOTE_HEARTBEAT_INTERVAL = 2000;

const calculateHeartbeatInterval = (config) =>
  isRemoteTarget(config) ? REMOTE_HEARTBEAT_INTERVAL : LOCAL_HEARTBEAT_INTERVAL;

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
      config.expose.wandaUrl = calculateWandaUrl(config);
      config.expose.remote_target = isRemoteTarget(config);
      config.env.heartbeat_interval = calculateHeartbeatInterval(config);
      return require('./cypress/plugins/index.js')(on, config);
    },
    testIsolation: false,
    baseUrl: 'http://localhost:4000',
  },
});
