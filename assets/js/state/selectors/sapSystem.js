import { filter } from 'lodash';
import { createSelector } from '@reduxjs/toolkit';

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';
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
  [(state) => enrichInstances(state.databasesList.databaseInstances)(state)],
  (enrichedInstances) => enrichedInstances
);

export const getSapSystem = (sapSystemID) => (state) =>
  state.sapSystemsList.sapSystems.find(
    (sapSystem) => sapSystemID === sapSystem.id
  );

export const getDatabase = (databaseID) => (state) =>
  state.databasesList.databases.find((database) => databaseID === database.id);

export const getEnrichedSapSystemDetails = createSelector(
  [
    (state, sapSystemID) => getSapSystem(sapSystemID)(state),
    (state, sapSystemID) =>
      enrichInstances(
        filter(state.sapSystemsList.applicationInstances, {
          sap_system_id: sapSystemID,
        })
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
    (state, databaseID) => getDatabase(databaseID)(state),
    (state, databaseID) =>
      enrichInstances(
        filter(state.databasesList.databaseInstances, {
          database_id: databaseID,
        })
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
    (state) => state.sapSystemsList.applicationInstances,
    (state) => state.databasesList.databaseInstances,
    (_, hostID) => hostID,
  ],
  (applicationInstances, databaseInstances, hostID) => {
    const foundDatabaseInstances = filter(databaseInstances, {
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
    (state) => state.databasesList.databaseInstances,
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
