// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { filter } from 'lodash';
import { createSelector } from '@reduxjs/toolkit';

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';

const enrichInstance = (instance, hosts, clusters) => {
  const host = hosts.find(({ id: hostID }) => hostID === instance.host_id);
  const cluster = clusters.find(
    ({ id: clusterID }) => clusterID === host?.cluster_id
  );

  return {
    ...instance,
    host: {
      ...host,
      cluster,
    },
  };
};

const enrichInstances = (instances, hosts, clusters) =>
  instances.map((instance) => enrichInstance(instance, hosts, clusters));

export const getEnrichedApplicationInstances = createSelector(
  [
    (state) => state.sapSystemsList.applicationInstances,
    (state) => state.hostsList.hosts,
    (state) => state.clustersList.clusters,
  ],
  (instances, hosts, clusters) => enrichInstances(instances, hosts, clusters)
);

export const getEnrichedDatabaseInstances = createSelector(
  [
    (state) => state.databasesList.databaseInstances,
    (state) => state.hostsList.hosts,
    (state) => state.clustersList.clusters,
  ],
  (instances, hosts, clusters) => enrichInstances(instances, hosts, clusters)
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
    getEnrichedApplicationInstances,
  ],
  (system, enrichedInstances) => {
    if (!system) return null;

    const filteredInstances = filter(enrichedInstances, {
      sap_system_id: system.id,
    });

    return {
      ...system,
      instances: filteredInstances,
      hosts: filteredInstances?.flatMap((instance) => instance.host),
    };
  }
);

export const getEnrichedDatabaseDetails = createSelector(
  [
    (state, databaseID) => getDatabase(databaseID)(state),
    getEnrichedDatabaseInstances,
  ],
  (database, enrichedInstances) => {
    if (!database) return null;

    const filteredInstances = filter(enrichedInstances, {
      database_id: database.id,
    });

    return {
      ...database,
      instances: filteredInstances,
      hosts: filteredInstances?.flatMap((instance) => instance.host),
    };
  }
);

export const getAllSAPInstances = createSelector(
  [
    (state) => state.sapSystemsList.applicationInstances,
    (state) => state.databasesList.databaseInstances,
  ],
  (applicationInstances, databaseInstances) =>
    applicationInstances
      .map((instance) => ({ ...instance, type: APPLICATION_TYPE }))
      .concat(
        databaseInstances.map((instance) => ({
          ...instance,
          type: DATABASE_TYPE,
        }))
      )
);

export const getInstancesOnHost = createSelector(
  [getAllSAPInstances, (_, hostID) => hostID],
  (instances, hostID) =>
    filter(instances, {
      host_id: hostID,
    })
);
