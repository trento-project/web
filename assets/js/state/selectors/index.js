import { keysToCamel } from '@lib/serialization';
import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model';

export const getHost = (id) => (state) =>
  state.hostsList.hosts.find((host) => host.id === id);

export const getCluster = (id) => (state) =>
  state.clustersList.clusters.find((cluster) => cluster.id === id);

export const getSapSystem = (id) => (state) => {
  return state.sapSystemsList.sapSystems.find(
    (sapSystem) => id === sapSystem.id
  );
};

export const getDatabase = (id) => (state) => {
  return state.databasesList.databases.find((database) => id === database.id);
};

export const getSapSystemDetail = (id) => (state) => {
  const system = keysToCamel(getSapSystem(id)(state));

  if (!system) return null;

  const instances = enrichInstances(
    state.sapSystemsList.applicationInstances,
    system.id,
    state
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
    state.sapSystemsList.databaseInstances,
    database.id,
    state
  );

  return {
    ...database,
    instances,
    hosts: instances?.flatMap((instance) => instance.host),
  };
};

const enrichInstances = (instances, sapSystemId, state) =>
  instances
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

export const getInstancesOnHost = (hostId) => (state) => {
  const { databaseInstances, applicationInstances } = state.sapSystemsList;

  const foundDatabaseInstances = databaseInstances
    .filter(isIdByKey('host_id', hostId))
    .map((instance) => ({ ...instance, type: DATABASE_TYPE }));

  const foundApplicationInstances = applicationInstances
    .filter(isIdByKey('host_id', hostId))
    .map((instance) => ({ ...instance, type: APPLICATION_TYPE }));

  return [...foundApplicationInstances, ...foundDatabaseInstances];
};

export const isIdByKey =
  (key, id) =>
  ({ [key]: keyToLookup }) =>
    keyToLookup === id;
