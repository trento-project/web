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
    sapSystemsList: { sapSystems, applicationInstances },
    databasesList: { databases, databaseInstances },
  } = state;

  const instances = applicationInstances.concat(databaseInstances);

  return sapSystems.concat(databases).filter((sapSystem) =>
    clusterHostIDs.some((hostID) =>
      instances
        .filter(({ sap_system_id }) => sap_system_id === sapSystem.id)
        .map(({ host_id }) => host_id)
        .includes(hostID)
    )
  );
};
