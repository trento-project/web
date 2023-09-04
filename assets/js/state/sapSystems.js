import { createAction, createSlice } from '@reduxjs/toolkit';
import { instancesMatch, upsertInstances, updateInstance } from './instances';

const initialState = {
  loading: false,
  sapSystems: [],
  // eslint-disable-next-line
  applicationInstances: [], // TODO: is this separation needed? Can it be just encapsulated into previous sapSystems?
  databaseInstances: [],
};

export const sapSystemsListSlice = createSlice({
  name: 'sapSystemsList',
  initialState,
  reducers: {
    // Here the payload comes from /api/sap_systems API when the application loads
    // Note that each sap system item has an application_instances and
    // a database_instances properties
    setSapSystems: (state, { payload: sapSystems }) => {
      state.sapSystems = sapSystems;

      state.applicationInstances = sapSystems.flatMap(
        (sapSystem) => sapSystem.application_instances
      );
      state.databaseInstances = sapSystems.flatMap(
        (sapSystem) => sapSystem.database_instances
      );
    },
    startSapSystemsLoading: (state) => {
      state.loading = true;
    },
    stopSapSystemsLoading: (state) => {
      state.loading = false;
    },
    // When a new SapSystemRegistered comes in, it gets appended to the list
    // Note that the item does not have any application_instances nor database_instances properties
    appendSapsystem: (state, { payload: newSapSystem }) => {
      state.sapSystems = [...state.sapSystems, newSapSystem];
    },
    removeSAPSystem: (state, { payload: { id } }) => {
      state.sapSystems = state.sapSystems.filter(
        (sapSystem) => sapSystem.id !== id
      );
      state.applicationInstances = state.applicationInstances.filter(
        (applicationInstance) => applicationInstance.sap_system_id !== id
      );
      state.databaseInstances = state.databaseInstances.filter(
        (databaseInstance) => databaseInstance.sap_system_id !== id
      );
    },
    updateSAPSystem: (state, { payload: sapSystemToUpdate }) => {
      state.sapSystems = state.sapSystems.map((sapSystem) => {
        if (sapSystem.id === sapSystemToUpdate.id) {
          sapSystem = { ...sapSystem, ...sapSystemToUpdate };
        }
        return sapSystem;
      });
    },
    updateSapSystemHealth: (state, { payload: { id, health } }) => {
      state.sapSystems = state.sapSystems.map((sapSystem) => {
        if (sapSystem.id === id) {
          sapSystem.health = health;
        }
        return sapSystem;
      });
    },
    addTagToSAPSystem: (state, { payload: { id, tags } }) => {
      state.sapSystems = state.sapSystems.map((sapSystem) => {
        if (sapSystem.id === id) {
          sapSystem.tags = [...sapSystem.tags, ...tags];
        }
        return sapSystem;
      });
    },
    removeTagFromSAPSystem: (state, { payload: { id, tags } }) => {
      state.sapSystems = state.sapSystems.map((sapSystem) => {
        if (sapSystem.id === id) {
          sapSystem.tags = sapSystem.tags.filter(
            (tag) => tag.value !== tags[0].value
          );
        }
        return sapSystem;
      });
    },
    // When a new ApplicationInstanceRegistered comes in,
    // it need to be appended to the list of the application instances of the relative sap system
    upsertApplicationInstances: (state, { payload: instances }) => {
      state.applicationInstances = upsertInstances(
        state.applicationInstances,
        instances
      );
    },
    // When a new DatabaseInstanceRegistered comes in,
    // it need to be appended to the list of the database instances of the relative sap system
    upsertDatabaseInstancesToSapSystem: (state, { payload: instances }) => {
      state.databaseInstances = upsertInstances(
        state.databaseInstances,
        instances
      );
    },
    removeApplicationInstance: (state, { payload: instance }) => {
      state.applicationInstances = state.applicationInstances.filter(
        (applicationInstance) => !instancesMatch(applicationInstance, instance)
      );
    },
    removeDatabaseInstanceFromSapSystem: (state, { payload: instance }) => {
      state.databaseInstances = state.databaseInstances.filter(
        (databaseInstance) => !instancesMatch(databaseInstance, instance)
      );
    },
    updateApplicationInstanceHost: (
      state,
      { payload: { sap_system_id, old_host_id, new_host_id, instance_number } }
    ) => {
      state.applicationInstances = updateInstance(
        state.applicationInstances,
        {
          sap_system_id,
          host_id: old_host_id,
          instance_number,
        },
        { host_id: new_host_id }
      );
    },
    updateApplicationInstanceHealth: (state, { payload: instance }) => {
      state.applicationInstances = updateInstance(
        state.applicationInstances,
        instance,
        { health: instance.health }
      );
    },
    updateSAPSystemDatabaseInstanceHealth: (state, { payload: instance }) => {
      state.databaseInstances = updateInstance(
        state.databaseInstances,
        instance,
        { health: instance.health }
      );
    },
    updateSAPSystemDatabaseInstanceSystemReplication: (
      state,
      { payload: instance }
    ) => {
      state.databaseInstances = updateInstance(
        state.databaseInstances,
        instance,
        {
          system_replication: instance.system_replication,
          system_replication_status: instance.system_replication_status,
        }
      );
    },
    updateApplicationInstanceAbsentAt: (state, { payload: instance }) => {
      state.applicationInstances = updateInstance(
        state.applicationInstances,
        instance,
        { absent_at: instance.absent_at }
      );
    },
    updateDatabaseInstanceAbsentToSAPSystem: (state, { payload: instance }) => {
      state.databaseInstances = updateInstance(
        state.databaseInstances,
        instance,
        { absent_at: instance.absent_at }
      );
    },
    setApplicationInstanceDeregistering: (state, { payload: instance }) => {
      state.applicationInstances = updateInstance(
        state.applicationInstances,
        instance,
        { deregistering: true }
      );
    },
    unsetApplicationInstanceDeregistering: (state, { payload: instance }) => {
      state.applicationInstances = updateInstance(
        state.applicationInstances,
        instance,
        { deregistering: false }
      );
    },
    setDatabaseInstanceDeregisteringToSAPSystem: (
      state,
      { payload: instance }
    ) => {
      state.databaseInstances = updateInstance(
        state.databaseInstances,
        instance,
        { deregistering: true }
      );
    },
    unsetDatabaseInstanceDeregisteringToSAPSystem: (
      state,
      { payload: instance }
    ) => {
      state.databaseInstances = updateInstance(
        state.databaseInstances,
        instance,
        { deregistering: false }
      );
    },
  },
});

export const SAP_SYSTEM_REGISTERED = 'SAP_SYSTEM_REGISTERED';
export const SAP_SYSTEM_HEALTH_CHANGED = 'SAP_SYSTEM_HEALTH_CHANGED';
export const APPLICATION_INSTANCE_REGISTERED =
  'APPLICATION_INSTANCE_REGISTERED';
export const APPLICATION_INSTANCE_MOVED = 'APPLICATION_INSTANCE_MOVED';
export const APPLICATION_INSTANCE_ABSENT_AT_CHANGED =
  'APPLICATION_INSTANCE_ABSENT_AT_CHANGED';
export const APPLICATION_INSTANCE_DEREGISTERED =
  'APPLICATION_INSTANCE_DEREGISTERED';
export const APPLICATION_INSTANCE_HEALTH_CHANGED =
  'APPLICATION_INSTANCE_HEALTH_CHANGED';
export const SAP_SYSTEM_DEREGISTERED = 'SAP_SYSTEM_DEREGISTERED';
export const SAP_SYSTEM_RESTORED = 'SAP_SYSTEM_RESTORED';
export const SAP_SYSTEM_UPDATED = 'SAP_SYSTEM_UPDATED';
export const DEREGISTER_APPLICATION_INSTANCE =
  'DEREGISTER_APPLICATION_INSTANCE';

export const deregisterApplicationInstance = createAction(
  DEREGISTER_APPLICATION_INSTANCE
);

export const {
  startSapSystemsLoading,
  stopSapSystemsLoading,
  setSapSystems,
  appendSapsystem,
  upsertApplicationInstances,
  removeApplicationInstance,
  upsertDatabaseInstancesToSapSystem,
  removeDatabaseInstanceFromSapSystem,
  updateSapSystemHealth,
  updateApplicationInstanceHost,
  updateApplicationInstanceHealth,
  updateSAPSystemDatabaseInstanceHealth,
  updateSAPSystemDatabaseInstanceSystemReplication,
  addTagToSAPSystem,
  removeTagFromSAPSystem,
  removeSAPSystem,
  updateSAPSystem,
  updateApplicationInstanceAbsentAt,
  setApplicationInstanceDeregistering,
  unsetApplicationInstanceDeregistering,
  setDatabaseInstanceDeregisteringToSAPSystem,
  updateDatabaseInstanceAbsentToSAPSystem,
  unsetDatabaseInstanceDeregisteringToSAPSystem,
} = sapSystemsListSlice.actions;

export default sapSystemsListSlice.reducer;
