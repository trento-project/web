import { get } from 'lodash';
import { createSelector } from '@reduxjs/toolkit';

export const getCluster =
  (id) =>
  ({ clustersList }) =>
    clustersList.clusters.find((cluster) => cluster.id === id);

export const getClusterHosts = createSelector(
  [({ hostsList: { hosts } }) => hosts, (_state, clusterID) => clusterID],
  (hosts, clusterID) =>
    hosts.filter(({ cluster_id }) => cluster_id === clusterID)
);

export const getHostID = ({ id: hostID }) => hostID;

export const getClusterHostIDs = createSelector(
  [getClusterHosts],
  (clusterHosts) => clusterHosts.map(getHostID)
);

export const getClusterName = (clusterID) => (state) => {
  const cluster = getCluster(clusterID)(state);
  return get(cluster, 'name', '');
};

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
  ) => {
    const instances = applicationInstances.concat(databaseInstances);

    return sapSystems.concat(databases).filter((sapSystem) =>
      clusterHostIDs.some((hostID) =>
        instances
          .filter(({ sap_system_id }) => sap_system_id === sapSystem.id)
          .map(({ host_id }) => host_id)
          .includes(hostID)
      )
    );
  }
);

export const getClusterSelectedChecks = createSelector(
  [(state, clusterID) => getCluster(clusterID)(state)],
  (cluster) => get(cluster, 'selected_checks', [])
);
