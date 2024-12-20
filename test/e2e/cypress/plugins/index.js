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
const { exec } = require('child_process');
const http = require('http');
const webpack = require('@cypress/webpack-preprocessor');
let heartbeatsIntervals = [];

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('before:run', async () => {
    const photofinishBinary =
      await getPhotofinishBinaryAndGiveExecutablePermissions();
    await runPhotofinishMainScenario(photofinishBinary);
  });
  cypressSplit(on, config);
  on('task', {
    startAgentHeartbeat(agents) {
      const { web_api_host, web_api_port, heartbeat_interval } = config.env;
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const heartbeat = (agentId) =>
        http
          .request({
            host: web_api_host,
            path: `/api/v1/hosts/${agentId}/heartbeat`,
            port: web_api_port,
            method: 'POST',
          })
          .end();

      sleep(500).then(() => {
        agents.forEach((agentId) => {
          heartbeat(agentId);
          let interval = setInterval(
            () => heartbeat(agentId),
            heartbeat_interval
          );
          heartbeatsIntervals.push(interval);
        });
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

  const webpackOptions = {
    webpackOptions: require('../../webpack.config'),
    watchOptions: {},
  };
  on('file:preprocessor', webpack(webpackOptions));

  return config;
};

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(new Error(`Error: ${stderr || error.message}`));
      else resolve(stdout.trim());
    });
  });
}

async function getPhotofinishBinaryAndGiveExecutablePermissions() {
  const photofinishBinary = runCommand('whereis photofinish | cut -d" " -f2');
  runCommand(`chmod +x ${photofinishBinary}`);
  return photofinishBinary;
}

async function runPhotofinishMainScenario(photofinishBinary) {
  runCommand(
    `cd ../.. && ${photofinishBinary} run --url "http://localhost:4000/api/collect" healthy-29-node-SAP-cluster`
  );
}
