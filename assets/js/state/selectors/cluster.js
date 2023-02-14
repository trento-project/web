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
