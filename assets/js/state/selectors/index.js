export const getHost = (id) => (state) =>
  state.hostsList.hosts.find((host) => host.id === id);

export const getCluster = (id) => (state) =>
  state.clustersList.clusters.find((cluster) => cluster.id === id);
