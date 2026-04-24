const { defineConfig } = require('cypress');

const DEMO = 'demo';
const DEV = 'dev';
const PROD = 'prod';

const calculateWandaUrl = (config) => {
  if (config.env.wandaUrl) return config.env.wandaUrl;
  return config.env.wanda_mode === DEMO
    ? 'http://localhost:4001'
    : `${config.baseUrl}/wanda`;
};

const calculateTimeouts = (config) => {
  if (config.env.web_mode === PROD) {
    return {
      defaultCommandTimeout: 100000,
      requestTimeout: 80000,
      responseTimeout: 80000,
    };
  }

  return {
    defaultCommandTimeout: 10000,
    requestTimeout: 5000,
    responseTimeout: 30000,
  };
};

module.exports = defineConfig({
  viewportWidth: 1366,
  viewportHeight: 768,
  env: {
    heartbeat_interval: 5000,
    project_root: '../..',
    photofinish_binary: 'photofinish',
    login_user: 'admin',
    login_password: 'adminpassword',
    idp_url: 'http://localhost:8081',
    wanda_mode: DEMO, //demo: local dev instance with, docker compose with wanda profile / prod: instance installed via rpm
    web_mode: DEV, //dev: local dev instance / prod: instance installed via rpm
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    async setupNodeEvents(on, config) {
      const timeouts = calculateTimeouts(config);
      config.defaultCommandTimeout = timeouts.defaultCommandTimeout;
      config.requestTimeout = timeouts.requestTimeout;
      config.responseTimeout = timeouts.responseTimeout;
      config.env.wandaUrl = calculateWandaUrl(config);
      return require('./cypress/plugins/index.js')(on, config);
    },
    testIsolation: false,
    baseUrl: 'http://localhost:4000',
  },
});
