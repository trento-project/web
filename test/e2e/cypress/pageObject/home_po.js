// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

export * from './base_po.js';
import * as basePage from './base_po.js';

// Test data
const sapSystemNwp = {
  sid: 'NWP',
  hosts: [
    '116d49bd-85e1-5e59-b820-83f66db8800c', // vmnwprd01
    '4b30a6af-4b52-5bda-bccb-f2248a12c992', // vmnwprd02
    'a3297d85-5e8b-5ac5-b8a3-55eebc2b8d12', // vmnwprd03
    '0fc07435-7ee2-54ca-b0de-fb27ffdc5deb', // vmnwprd04
    '9cd46919-5f19-59aa-993e-cf3736c71053', // vmhdbprd01
    'b767b3e9-e802-587e-a442-541d093b86b9', // vmhdbprd02
  ],
};

// Selectors
const nwpSystemCell = `td:contains("${sapSystemNwp.sid}")`;
const nwpSystemRow = `tr:has(td:contains("${sapSystemNwp.sid}"))`;
const nwpSystemHealthIcons = (cellPosition) =>
  `${nwpSystemRow} td:eq(${cellPosition}) svg`;

// Validations
export const nwpSystemShouldBeDisplayed = () =>
  cy.get(nwpSystemCell).should('be.visible');

export const nwpSystemShouldNotBeDisplayed = () =>
  cy.get(nwpSystemCell).should('not.exist');

export const nwpSystemRowIsMarkedStale = () =>
  basePage.elementIsMarkedStale(nwpSystemRow);

export const nwpSystemRowIsMarkedInSync = () =>
  basePage.elementIsMarkedInSync(nwpSystemRow);

export const nwpApplicationInstancesHealthIsMarkedAsStale = () =>
  basePage.healthIconIsMarkedStale(nwpSystemHealthIcons(1));

export const nwpApplicationClusterHealthIsMarkedAsStale = () =>
  basePage.healthIconIsMarkedStale(nwpSystemHealthIcons(2));

export const nwpDatabaseHealthIsMarkedAsStale = () =>
  basePage.healthIconIsMarkedStale(nwpSystemHealthIcons(3));

export const nwpDatabaseClusterHealthIsMarkedAsStale = () =>
  basePage.healthIconIsMarkedStale(nwpSystemHealthIcons(4));

export const nwpHostsHealthIsMarkedAsStale = () =>
  basePage.healthIconIsMarkedStale(nwpSystemHealthIcons(5));

// API
export const apiDeregisterSapSystemNwpHost = () =>
  basePage.apiDeregisterHost(sapSystemNwp.hosts[4]);

export const startNwpSystemAgentsHeartbeat = () =>
  basePage.startAgentsHeartbeat(sapSystemNwp.hosts);

export const stopNwpApplicationInstanceAgentHeartbeat = () =>
  basePage.stopAgentsHeartbeat([sapSystemNwp.hosts[2]]);

export const stopNwpClusteredApplicationInstanceAgentHeartbeat = () =>
  basePage.stopAgentsHeartbeat([sapSystemNwp.hosts[0]]);

export const stopNwpClusteredDatabaseInstanceAgentHeartbeat = () =>
  basePage.stopAgentsHeartbeat([sapSystemNwp.hosts[4]]);

export const restoreNwpSystemData = () =>
  basePage.loadScenario('sapsystem-NWP-restore');
