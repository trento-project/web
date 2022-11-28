import { keysToCamel } from '@lib/serialization';
import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model';

export const isIdByKey = (key, id) => ({ [key]: keyToLookup }) => keyToLookup === id;

export const getHost = (id) => (state) => state.hostsList.hosts.find((host) => host.id === id);

export const getCluster = (id) => (state) => state.clustersList.clusters.find((cluster) => cluster.id === id);

const enrichInstances = (instances, sapSystemId, state) => instances
  .filter(isIdByKey('sap_system_id', sapSystemId))
  .map(keysToCamel)
  .map((instance) => {
    const host = getHost(instance.hostId)(state);
    const cluster = getCluster(host?.cluster_id)(state);
    return {
      ...instance,
      host: {
        ...host,
        cluster,
      },
    };
  });

export const getSapSystem = (id) => (state) => state.sapSystemsList.sapSystems.find(
  (sapSystem) => id === sapSystem.id,
);

export const getDatabase = (id) => (state) => state.databasesList.databases.find((database) => id === database.id);

export const getSapSystemDetail = (id) => (state) => {
  const system = keysToCamel(getSapSystem(id)(state));

  if (!system) return null;

  const instances = enrichInstances(
    state.sapSystemsList.applicationInstances,
    system.id,
    state,
  );

  return {
    ...system,
    instances,
    hosts: instances?.flatMap((instance) => instance.host),
  };
};

export const getDatabaseDetail = (id) => (state) => {
  const database = keysToCamel(getDatabase(id)(state));

  if (!database) return null;

  const instances = enrichInstances(
    state.databasesList.databaseInstances,
    database.id,
    state,
  );

  return {
    ...database,
    instances,
    hosts: instances?.flatMap((instance) => instance.host),
  };
};

export const getClusterByHost = (hostId) => (state) => {
  const host = state.hostsList.hosts.find((host) => host.id === hostId);
  return state.clustersList.clusters.find(isIdByKey('id', host?.cluster_id));
};

export const getInstancesOnHost = (hostId) => (state) => {
  const { databaseInstances, applicationInstances } = state.sapSystemsList;

  const availableDatabaseInstances = databaseInstances.length > 0
    ? databaseInstances
    : state.databasesList.databaseInstances;

  const foundDatabaseInstances = availableDatabaseInstances
    .filter(isIdByKey('host_id', hostId))
    .map((instance) => ({ ...instance, type: DATABASE_TYPE }));

  const foundApplicationInstances = applicationInstances
    .filter(isIdByKey('host_id', hostId))
    .map((instance) => ({ ...instance, type: APPLICATION_TYPE }));

  return [...foundApplicationInstances, ...foundDatabaseInstances];
};
