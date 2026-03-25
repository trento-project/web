const { defineConfig } = require('cypress');

const calculateWandaUrl = (config) => {
  if (config.env.wandaUrl) return config.env.wandaUrl;

  return config.baseUrl && config.baseUrl.includes('localhost')
    ? 'http://localhost:4001'
    : `${config.baseUrl}/wanda`;
};

const discoverApiKey = async (config) => {
  const { baseUrl, env } = config;
  const { login_user, login_password } = env;

  const loginResponse = await fetch(`${baseUrl}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: login_user,
      password: login_password,
    }),
  });

  if (!loginResponse.ok) {
    throw new Error(`Login failed with status ${loginResponse.status}`);
  }

  const { access_token } = await loginResponse.json();

  const apiKeyResponse = await fetch(`${baseUrl}/api/v1/settings/api_key`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!apiKeyResponse.ok) {
    throw new Error(
      `API Key retrieval failed with status ${apiKeyResponse.status}`
    );
  }
  const { generated_api_key } = await apiKeyResponse.json();
  return generated_api_key;
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
    destination_environment: 'dev',
    idp_url: 'http://localhost:8081',
    auto_discover_api_key: false,
    api_key: '',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    async setupNodeEvents(on, config) {
      config.env.wandaUrl = calculateWandaUrl(config);

      on('task', {
        async refreshApiKey() {
          return await discoverApiKey(config);
        },
      });

      if (
        config.env.auto_discover_api_key === true ||
        config.env.auto_discover_api_key === 'true'
      ) {
        config.env.api_key = await discoverApiKey(config);
      }

      return require('./cypress/plugins/index.js')(on, config);
    },
    testIsolation: false,
    baseUrl: 'http://localhost:4000',
  },
});
