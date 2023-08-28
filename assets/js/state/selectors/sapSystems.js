import { filter } from 'lodash';
import { createSelector } from '@reduxjs/toolkit';

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model';
import { getCluster } from '@state/selectors/cluster';
import { getHost } from '@state/selectors/host';

const enrichInstance = (instance) => (state) => {
  const host = getHost(instance.host_id)(state);
  const cluster = getCluster(host?.cluster_id)(state);

  return {
    ...instance,
    host: {
      ...host,
      cluster,
    },
  };
};

const enrichInstances = (instances) => (state) =>
  instances.map((instance) => enrichInstance(instance)(state));

export const getEnrichedApplicationInstances = createSelector(
  [
    (state) =>
      enrichInstances(state.sapSystemsList.applicationInstances)(state),
  ],
  (enrichedInstances) => enrichedInstances
);

export const getEnrichedDatabaseInstances = createSelector(
  [(state) => enrichInstances(state.sapSystemsList.databaseInstances)(state)],
  (enrichedInstances) => enrichedInstances
);

export const getSapSystem = (id) => (state) =>
  state.sapSystemsList.sapSystems.find((sapSystem) => id === sapSystem.id);

export const getDatabase = (id) => (state) =>
  state.databasesList.databases.find((database) => id === database.id);

export const getEnrichedSapSystemDetails = createSelector(
  [
    (id, state) => getSapSystem(id)(state),
    (id, state) =>
      enrichInstances(
        filter(state.sapSystemsList.applicationInstances, { sap_system_id: id })
      )(state),
  ],
  (system, instances) => {
    if (!system) return null;

    return {
      ...system,
      instances,
      hosts: instances?.flatMap((instance) => instance.host),
    };
  }
);

export const getEnrichedDatabaseDetails = createSelector(
  [
    (id, state) => getDatabase(id)(state),
    (id, state) =>
      enrichInstances(
        filter(state.databasesList.databaseInstances, { sap_system_id: id })
      )(state),
  ],
  (database, instances) => {
    if (!database) return null;

    return {
      ...database,
      instances,
      hosts: instances?.flatMap((instance) => instance.host),
    };
  }
);

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

    const foundDatabaseInstances = filter(availableDatabaseInstances, {
      host_id: hostID,
    }).map((instance) => ({ ...instance, type: DATABASE_TYPE }));

    const foundApplicationInstances = filter(applicationInstances, {
      host_id: hostID,
    }).map((instance) => ({ ...instance, type: APPLICATION_TYPE }));

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
