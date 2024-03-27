import { get, find, uniq, has, set } from 'lodash';
import { createSelector } from '@reduxjs/toolkit';

import {
  FS_TYPE_RESOURCE_MANAGED,
  FS_TYPE_SIMPLE_MOUNT,
  FS_TYPE_MIXED,
} from '@lib/model/clusters';

import { getHostID } from './host';
import { getInstanceID } from '../instances';

export const getCluster =
  (id) =>
  ({ clustersList }) =>
    clustersList.clusters.find((cluster) => cluster.id === id);

export const getClusterHosts = createSelector(
  [({ hostsList: { hosts } }) => hosts, (_state, clusterID) => clusterID],
  (hosts, clusterID) =>
    hosts.filter(({ cluster_id }) => cluster_id === clusterID)
);

export const getClusterHostIDs = createSelector(
  [getClusterHosts],
  (clusterHosts) => clusterHosts.map(getHostID)
);

export const getClusterIDs = createSelector(
  [(state) => state.clustersList.clusters],
  (clusters) => clusters.map(({ id }) => id)
);

export const getClusterName = (clusterID) => (state) => {
  const cluster = getCluster(clusterID)(state);
  return get(cluster, 'name', '');
};

export const getClusterByHost = (state, hostID) => {
  const host = state.hostsList.hosts.find((h) => h.id === hostID);
  return find(state.clustersList.clusters, { id: host?.cluster_id });
};

const getSystemsByClusterHosts = (instances, systems, clusterHostIDs) =>
  systems.filter((system) =>
    clusterHostIDs.some((hostID) =>
      instances
        .map((instance) => set(instance, 'instanceID', getInstanceID(instance)))
        .filter(({ instanceID }) => instanceID === system.id)
        .map(({ host_id }) => host_id)
        .includes(hostID)
    )
  );

export const getClusterSapSystems = createSelector(
  [
    getClusterHostIDs,
    (state) => state.sapSystemsList.sapSystems,
    (state) => state.sapSystemsList.applicationInstances,
    (state) => state.databasesList.databases,
    (state) => state.databasesList.databaseInstances,
  ],
  (
    clusterHostIDs,
    sapSystems,
    applicationInstances,
    databases,
    databaseInstances
  ) =>
    getSystemsByClusterHosts(
      [...applicationInstances, ...databaseInstances],
      [...sapSystems, ...databases],
      clusterHostIDs
    )
);

export const getClusterSapApplicationInstances = createSelector(
  [
    getClusterHostIDs,
    (state) => state.sapSystemsList.sapSystems,
    (state) => state.sapSystemsList.applicationInstances,
  ],
  (clusterHostIDs, sapSystems, applicationInstances) =>
    getSystemsByClusterHosts(applicationInstances, sapSystems, clusterHostIDs)
);

export const MIXED_VERSIONS = 'mixed_versions';

export const getEnsaVersion = createSelector(
  [getClusterSapApplicationInstances],
  (sapSystems) => {
    const ensaVersions = new Set();
    sapSystems.forEach(({ ensa_version }) => {
      ensaVersions.add(ensa_version);
    });

    const firstEnsaVersion = [...ensaVersions.values()][0];

    return firstEnsaVersion && ensaVersions.size === 1
      ? firstEnsaVersion
      : MIXED_VERSIONS;
  }
);

export const getFilesystemType = createSelector(
  [(state, clusterID) => getCluster(clusterID)(state)],
  (cluster) => {
    const sapSystems = get(cluster, ['details', 'sap_systems'], []);

    const filesystems = sapSystems
      .filter((sapSystem) => has(sapSystem, 'filesystem_resource_based'))
      .map(
        ({ filesystem_resource_based: filesystemResourceBased }) =>
          filesystemResourceBased
      );

    if (uniq(filesystems).length === 1) {
      const resourceManaged = filesystems[0];
      return resourceManaged ? FS_TYPE_RESOURCE_MANAGED : FS_TYPE_SIMPLE_MOUNT;
    }

    return FS_TYPE_MIXED;
  }
);

export const getClusterSelectedChecks = createSelector(
  [(state, clusterID) => getCluster(clusterID)(state)],
  (cluster) => get(cluster, 'selected_checks', [])
);
