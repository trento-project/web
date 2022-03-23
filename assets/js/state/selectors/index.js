export const getHost = (id) => (state) =>
  state.hostsList.hosts.find((host) => host.id === id);

export const getCluster = (id) => (state) =>
  state.clustersList.clusters.find((cluster) => cluster.id === id);

export const findSapSystem = (id) => (state) => {
  return state.sapSystemsList.sapSystems.find(
    (sapSystem) => id === sapSystem.id
  );
};

export const findDatabase = (id) => (state) => {
  return state.databasesList.databases.find((database) => id === database.id);
};
