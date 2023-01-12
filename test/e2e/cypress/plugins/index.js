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
// eslint-disable-next-line no-unused-vars

const http = require('http');
let heartbeatsIntervals = [];

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('task', {
    startAgentHeartbeat(agents) {
      const { web_api_host, web_api_port, heartbeat_interval } = config.env;
      const heartbeat = (agentId) =>
        http
          .request({
            host: web_api_host,
            path: `/api/hosts/${agentId}/heartbeat`,
            port: web_api_port,
            method: 'POST',
          })
          .end();

      agents.forEach((agentId) => {
        heartbeat(agentId);
        let interval = setInterval(
          () => heartbeat(agentId),
          heartbeat_interval
        );
        heartbeatsIntervals.push(interval);
      });
      return null;
    },
  });

  on('task', {
    stopAgentsHeartbeat() {
      heartbeatsIntervals.forEach((interval) => {
        clearInterval(interval);
      });
      return null;
    },
  });

  return config;
};
