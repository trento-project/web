export const getCluster =
  (id) =>
  ({ clustersList }) =>
    clustersList.clusters.find((cluster) => cluster.id === id);

export const getClusterHostIDs =
  (clusterID) =>
  ({ hostsList }) =>
    hostsList.hosts
      .filter((host) => host.cluster_id === clusterID)
      .map(({ id: hostID }) => hostID);

export const getClusterHostNames =
  (clusterID) =>
  ({ hostsList }) =>
    hostsList.hosts
      .filter(({ cluster_id }) => cluster_id === clusterID)
      .map(({ id, hostname }) => ({ id, hostname }));

export const getClusterName =
  (clusterID) =>
  ({ clustersList }) =>
    getCluster(clusterID)({ clustersList })?.name || '';
