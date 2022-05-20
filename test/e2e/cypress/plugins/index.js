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

    selectChecks({ clusterId, checkIds }) {
      const { web_api_host, web_api_port } = config.env;
      const selection_data = JSON.stringify({
        checks: checkIds,
      });

      let selection_req = http.request({
        host: web_api_host,
        path: `/api/clusters/${clusterId}/checks`,
        port: web_api_port,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      selection_req.write(selection_data);
      selection_req.end();

      return null;
    },

    mockStartChecksExecution({ clusterId, executionId }) {
      const { web_api_host, web_api_port } = config.env;
      const exec_start_data = JSON.stringify({
        event: 'execution_started',
        execution_id: executionId,
        payload: {
          cluster_id: clusterId,
        },
      });

      let started_req = http.request({
        host: web_api_host,
        path: '/api/runner/callback',
        port: web_api_port,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      started_req.write(exec_start_data);
      started_req.end();

      return null;
    },

    mockCompleteChecksExecution({ clusterId, hostIds, result, executionId }) {
      const { web_api_host, web_api_port } = config.env;

      const executionCompletedData = JSON.stringify({
        event: 'execution_completed',
        execution_id: executionId,
        payload: {
          cluster_id: clusterId,
          hosts: hostIds.map((hostId) => {
            return {
              host_id: hostId,
              reachable: true,
              msg: 'some msg',
              results: [
                {
                  check_id: '156F64',
                  result: result,
                  msg: 'some msg',
                },
              ],
            };
          }),
        },
      });

      let completed_req = http.request({
        host: web_api_host,
        path: '/api/runner/callback',
        port: web_api_port,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      completed_req.write(executionCompletedData);
      completed_req.end();

      return null;
    },
  });
};
