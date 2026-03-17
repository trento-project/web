const { defineConfig } = require('cypress');

const calculateWandaUrl = (config) => {
  if (config.env.wandaUrl) return config.env.wandaUrl;

  return config.baseUrl && config.baseUrl.includes('localhost')
    ? 'http://localhost:4001'
    : `${config.baseUrl}/wanda`;
};

module.exports = defineConfig({
  viewportWidth: 1366,
  viewportHeight: 768,
  defaultCommandTimeout: 10000,
  env: {
    web_api_host: 'localhost',
    web_api_port: 4000,
    heartbeat_interval: 5000,
    project_root: '../..',
    photofinish_binary: 'photofinish',
    login_user: 'admin',
    login_password: 'adminpassword',
    destination_environment: 'dev',
    idp_url: 'http://localhost:8081',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      config.env.wandaUrl = calculateWandaUrl(config);
      return require('./cypress/plugins/index.js')(on, config);
    },
    testIsolation: false,
    baseUrl: 'http://localhost:4000',
  },
});
