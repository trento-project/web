/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */

const cypressSplit = require('cypress-split');
const webpack = require('@cypress/webpack-preprocessor');

let heartbeatsIntervals = [];

const fetchApiKeyFromServer = async (config) => {
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

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  cypressSplit(on, config);

  on('task', {
    getApiKey() {
      return fetchApiKeyFromServer(config);
    },
    searchEmailInMailpit,
    deleteAllEmailsFromMailpit,

    startAgentHeartbeat(agents) {
      const heartbeatInterval = config.env.heartbeat_interval;
      const heartbeat = (agentId) => {
        const headers = {};

        const apiKey = cachedApiKey || config.env.api_key;
        if (apiKey) headers['X-Trento-apiKey'] = apiKey;

        return fetch(`${config.baseUrl}/api/v1/hosts/${agentId}/heartbeat`, {
          method: 'POST',
          headers,
        });
      };

      agents.forEach((agentId) => {
        heartbeat(agentId);
        let interval = setInterval(() => heartbeat(agentId), heartbeatInterval);
        heartbeatsIntervals.push(interval);
      });
      return null;
    },

    stopAgentsHeartbeat() {
      heartbeatsIntervals.forEach((interval) => {
        clearInterval(interval);
      });
      heartbeatsIntervals = [];
      return null;
    },
  });

  const webpackOptions = {
    webpackOptions: require('../../webpack.config'),
    watchOptions: {},
  };
  on('file:preprocessor', webpack(webpackOptions));

  return config;
};

const mailpitUrl = 'http://localhost:8025/api/v1';

const searchEmailInMailpit = (
  subject,
  options = { retries: 40, delay: 500 }
) => {
  const { retries, delay } = options;
  const searchUrl = `${mailpitUrl}/search?query=subject:"${subject}"`;

  return fetch(searchUrl)
    .then((res) => (res.ok ? res.json() : false))
    .then((data) => {
      if (data && data.messages && data.messages.length > 0) {
        return data.messages.map((msg) => msg.ID);
      }

      if (retries > 0) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(
              searchEmailInMailpit(subject, { retries: retries - 1, delay })
            );
          }, delay);
        });
      }

      return [];
    })
    .catch(() => []);
};

const deleteEmailsFromMailpit = (emailIds) => {
  const deleteUrl = `${mailpitUrl}/messages`;
  return fetch(deleteUrl, {
    method: 'DELETE',
    body: JSON.stringify({ IDs: emailIds }),
  });
};

const deleteAllEmailsFromMailpit = () => deleteEmailsFromMailpit([]);
