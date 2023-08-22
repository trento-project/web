import { createSelector } from '@reduxjs/toolkit';

import { keysToCamel } from '@lib/serialization';
import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model';
import { getCluster } from '@state/selectors/cluster';
import { getHost } from '@state/selectors/host';

export const isIdByKey =
  (key, id) =>
  ({ [key]: keyToLookup }) =>
    keyToLookup === id;

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

export const getSapSystem = (id) => (state) =>
  state.sapSystemsList.sapSystems.find((sapSystem) => id === sapSystem.id);

export const getDatabase = (id) => (state) =>
  state.databasesList.databases.find((database) => id === database.id);

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
    state.databasesList.databaseInstances,
    database.id,
    state
  );

  return {
    ...database,
    instances,
    hosts: instances?.flatMap((instance) => instance.host),
  };
};

export const getClusterByHost = (state, hostID) => {
  const host = state.hostsList.hosts.find((h) => h.id === hostID);
  return state.clustersList.clusters.find(isIdByKey('id', host?.cluster_id));
};

export const getInstancesOnHost = createSelector(
  [
    (state) => state.sapSystemsList.databaseInstances,
    (state) => state.sapSystemsList.applicationInstances,
    (state) => state.databasesList.databaseInstances,
    (_, hostID) => hostID,
  ],
  (databaseInstances, applicationInstances, databasesListInstances, hostID) => {
    const availableDatabaseInstances =
      databaseInstances.length > 0 ? databaseInstances : databasesListInstances;

    const foundDatabaseInstances = availableDatabaseInstances
      .filter(isIdByKey('host_id', hostID))
      .map((instance) => ({ ...instance, type: DATABASE_TYPE }));

    const foundApplicationInstances = applicationInstances
      .filter(isIdByKey('host_id', hostID))
      .map((instance) => ({ ...instance, type: APPLICATION_TYPE }));

    return [...foundApplicationInstances, ...foundDatabaseInstances];
  }
);

export const getAllSAPInstances = createSelector(
  [
    (state) => state.sapSystemsList.applicationInstances,
    (state) => state.sapSystemsList.databaseInstances,
  ],
  (applicationInstances, databaseInstances) =>
    applicationInstances
      .map((instance) => ({ ...instance, type: 'sap_systems' }))
      .concat(
        databaseInstances.map((instance) => ({
          ...instance,
          type: 'databases',
        }))
      )
);
