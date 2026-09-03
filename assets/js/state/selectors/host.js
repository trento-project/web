// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { get } from 'lodash';
import { createSelector } from '@reduxjs/toolkit';

import { buildCidrNotation } from '@lib/network/ip';
import { getAllSAPInstances } from '@state/selectors/sapSystem';

function getInstancesByHost(instances, hostId) {
  return instances.filter((instance) => instance.host_id === hostId);
}

export const hostsListSelector = createSelector(
  [
    (state) => state.hostsList.hosts,
    (state) => state.clustersList.clusters,
    getAllSAPInstances,
  ],
  (hosts, clusters, allInstances) =>
    hosts.map((host) => {
      const cluster = clusters.find((c) => c.id === host.cluster_id);
      const sapSystemList = getInstancesByHost(allInstances, host.id);

      return {
        health: host.health,
        hostname: host.hostname,
        ip: buildCidrNotation(host.ip_addresses, host.netmasks),
        provider: host.provider,
        sid: sapSystemList.map((sapSystem) => sapSystem.sid),
        cluster,
        agent_version: host.agent_version,
        id: host.id,
        tags: (host.tags && host.tags.map((tag) => tag.value)) || [],
        sap_systems: sapSystemList,
        deregisterable: host.deregisterable,
        deregistering: host.deregistering,
        staleAt: host.stale_at,
      };
    })
);

export const getHost = (id) => (state) =>
  state.hostsList.hosts.find((host) => host.id === id);

export const getHostID = ({ id: hostID }) => hostID;

export const getHostSelectedChecks = createSelector(
  [(state, hostID) => getHost(hostID)(state)],
  (host) => get(host, 'selected_checks', [])
);

export const getHostIDs = createSelector(
  [(state) => state.hostsList.hosts],
  (hosts) => hosts.map(getHostID)
);
