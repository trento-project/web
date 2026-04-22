const { defineConfig } = require('cypress');

const calculateWandaUrl = (config) => {
  if (config.env.wandaUrl) return config.env.wandaUrl;
  return config.env.wanda_mode === 'demo'
    ? 'http://localhost:4001'
    : `${config.baseUrl}/wanda`;
};

module.exports = defineConfig({
  viewportWidth: 1366,
  viewportHeight: 768,
  defaultCommandTimeout: 10000,
  env: {
    heartbeat_interval: 5000,
    project_root: '../..',
    photofinish_binary: 'photofinish',
    login_user: 'admin',
    login_password: 'adminpassword',
    idp_url: 'http://localhost:8081',
    wanda_mode: 'demo', //demo: local dev instance / real: real instance installed via rpm
    web_mode: 'dev', //dev: local dev instance / real: real instance installed via rpm
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    async setupNodeEvents(on, config) {
      config.env.wandaUrl = calculateWandaUrl(config);
      return require('./cypress/plugins/index.js')(on, config);
    },
    testIsolation: false,
    baseUrl: 'http://localhost:4000',
  },
});
