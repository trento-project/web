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

export const getClusterSapSystems = (clusterID) => (state) => {
  const clusterHostIDs = getClusterHostIDs(clusterID)(state);
  const {
    sapSystemsList: { sapSystems },
  } = state;

  return sapSystems.filter(({ application_instances, database_instances }) =>
    clusterHostIDs.some((hostID) =>
      application_instances
        .concat(database_instances)
        .map(({ host_id }) => host_id)
        .includes(hostID)
    )
  );
};
