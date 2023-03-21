export const getCluster =
  (id) =>
  ({ clustersList }) =>
    clustersList.clusters.find((cluster) => cluster.id === id);

export const getClusterHosts =
  (clusterID) =>
  ({ hostsList: { hosts } }) =>
    hosts.filter(({ cluster_id }) => cluster_id === clusterID);

export const getHostID = ({ id: hostID }) => hostID;

export const getClusterHostIDs = (clusterID) => (state) =>
  getClusterHosts(clusterID)(state).map(getHostID);

export const getClusterName =
  (clusterID) =>
  ({ clustersList }) =>
    getCluster(clusterID)({ clustersList })?.name || '';
