import { getCluster } from '@state/selectors';

export const getClusterHostIDs =
  (clusterID) =>
  ({ hostsList }) =>
    hostsList.hosts
      .filter((host) => host.cluster_id === clusterID)
      .map(({ id: hostID }) => hostID);

export const getClusterSelectedChecks = (clusterID) => (state) =>
  getCluster(clusterID)(state).selected_checks;

export const getClusterName =
  (clusterID) =>
  ({ clustersList }) =>
    getCluster(clusterID)({ clustersList })?.name || '';
