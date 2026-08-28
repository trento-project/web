// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

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

const http = require('http');
const https = require('https');
const cypressSplit = require('cypress-split');
const webpack = require('@cypress/webpack-preprocessor');
let heartbeatsIntervals = {};

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  const url = new URL(config.baseUrl);
  const isHttps = url.protocol === 'https:';
  const transport = isHttps ? https : http;
  // Heartbeats are sent for every agent on every interval. Against a remote
  // target that is a TLS handshake per request unless connections are reused.
  const heartbeatAgent = new transport.Agent({ keepAlive: true });

  cypressSplit(on, config);
  on('task', {
    searchEmailInMailpit,
    deleteAllEmailsFromMailpit,
    startAgentHeartbeat({ agents, apiKey }) {
      const heartbeat = (agentId) => {
        const request = transport.request(
          {
            host: url.hostname,
            path: `/api/v1/hosts/${agentId}/heartbeat`,
            port: url.port || (isHttps ? 443 : 80),
            method: 'POST',
            headers: apiKey ? { 'X-Trento-ApiKey': apiKey } : {},
            agent: heartbeatAgent,
          },
          // The response must be drained for the socket to be released back
          // to the keep-alive pool.
          (response) => response.resume()
        );

        // Without a listener, a transient network error on the request emits
        // an uncaught exception and takes the plugin process down.
        request.on('error', (error) =>
          // eslint-disable-next-line no-console
          console.error(
            `Heartbeat for agent ${agentId} failed: ${error.message}`
          )
        );

        request.end();
      };

      agents.forEach((agentId) => {
        heartbeat(agentId);
        clearInterval(heartbeatsIntervals[agentId]);
        heartbeatsIntervals[agentId] = setInterval(
          () => heartbeat(agentId),
          config.env.heartbeat_interval
        );
      });

      return null;
    },
    stopAgentsHeartbeat({ agents = [] }) {
      const agentIds = agents.length
        ? agents
        : Object.keys(heartbeatsIntervals);
      agentIds.forEach((agentId) => {
        clearInterval(heartbeatsIntervals[agentId]);
        delete heartbeatsIntervals[agentId];
      });

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
