import { createSlice } from '@reduxjs/toolkit';
import { upsertInstances, maybeUpdateInstanceHealth } from './instances';

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
    setSapSystems: (state, { payload }) => {
      state.sapSystems = payload;

      state.applicationInstances = payload.flatMap(
        (sapSystem) => sapSystem.application_instances
      );
      state.databaseInstances = payload.flatMap(
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
    appendSapsystem: (state, action) => {
      state.sapSystems = [...state.sapSystems, action.payload];
    },
    // When a new ApplicationInstanceRegistered comes in,
    // it need to be appended to the list of the application instances of the relative sap system
    upsertApplicationInstances: (state, action) => {
      state.applicationInstances = upsertInstances(
        state.applicationInstances,
        action.payload
      );
    },
    removeApplicationInstance: (
      state,
      { payload: { sap_system_id, host_id, instance_number } }
    ) => {
      state.applicationInstances = state.applicationInstances.filter(
        (applicationInstance) =>
          !(
            applicationInstance.sap_system_id === sap_system_id &&
            applicationInstance.host_id === host_id &&
            applicationInstance.instance_number === instance_number
          )
      );
    },
    // When a new DatabaseInstanceRegistered comes in,
    // it need to be appended to the list of the database instances of the relative sap system
    upsertDatabaseInstancesToSapSystem: (state, action) => {
      state.databaseInstances = upsertInstances(
        state.databaseInstances,
        action.payload
      );
    },
    removeDatabaseInstanceFromSapSystem: (
      state,
      { payload: { sap_system_id, host_id, instance_number } }
    ) => {
      state.databaseInstances = state.databaseInstances.filter(
        (databaseInstance) =>
          !(
            databaseInstance.sap_system_id === sap_system_id &&
            databaseInstance.host_id === host_id &&
            databaseInstance.instance_number === instance_number
          )
      );
    },
    updateSapSystemHealth: (state, action) => {
      state.sapSystems = state.sapSystems.map((sapSystem) => {
        if (sapSystem.id === action.payload.id) {
          sapSystem.health = action.payload.health;
        }
        return sapSystem;
      });
    },
    updateApplicationInstanceHost: (
      state,
      { payload: { sap_system_id, old_host_id, new_host_id, instance_number } }
    ) => {
      state.applicationInstances = state.applicationInstances.map(
        (instance) => {
          if (
            instance.sap_system_id === sap_system_id &&
            instance.host_id === old_host_id &&
            instance.instance_number === instance_number
          ) {
            instance.host_id = new_host_id;
          }
          return instance;
        }
      );
    },
    updateApplicationInstanceHealth: (state, action) => {
      state.applicationInstances = state.applicationInstances.map((instance) =>
        maybeUpdateInstanceHealth(action.payload, instance)
      );
    },
    updateSAPSystemDatabaseInstanceHealth: (state, action) => {
      state.databaseInstances = state.databaseInstances.map((instance) =>
        maybeUpdateInstanceHealth(action.payload, instance)
      );
    },
    updateSAPSystemDatabaseInstanceSystemReplication: (state, action) => {
      state.databaseInstances = state.databaseInstances.map((instance) => {
        if (
          action.payload.sap_system_id === instance.sap_system_id &&
          action.payload.host_id === instance.host_id &&
          action.payload.instance_number === instance.instance_number
        ) {
          instance.system_replication = action.payload.system_replication;
          instance.system_replication_status =
            action.payload.system_replication_status;
        }
        return instance;
      });
    },
    addTagToSAPSystem: (state, action) => {
      state.sapSystems = state.sapSystems.map((sapSystem) => {
        if (sapSystem.id === action.payload.id) {
          sapSystem.tags = [...sapSystem.tags, ...action.payload.tags];
        }
        return sapSystem;
      });
    },
    removeTagFromSAPSystem: (state, action) => {
      state.sapSystems = state.sapSystems.map((sapSystem) => {
        if (sapSystem.id === action.payload.id) {
          sapSystem.tags = sapSystem.tags.filter(
            (tag) => tag.value !== action.payload.tags[0].value
          );
        }
        return sapSystem;
      });
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
    updateSAPSystem: (state, { payload }) => {
      state.sapSystems = state.sapSystems.map((sapSystem) => {
        if (sapSystem.id === payload.id) {
          sapSystem = { ...sapSystem, ...payload };
        }
        return sapSystem;
      });
    },
  },
});

export const SAP_SYSTEM_REGISTERED = 'SAP_SYSTEM_REGISTERED';
export const SAP_SYSTEM_HEALTH_CHANGED = 'SAP_SYSTEM_HEALTH_CHANGED';
export const APPLICATION_INSTANCE_REGISTERED =
  'APPLICATION_INSTANCE_REGISTERED';
export const APPLICATION_INSTANCE_MOVED = 'APPLICATION_INSTANCE_MOVED';
export const APPLICATION_INSTANCE_DEREGISTERED =
  'APPLICATION_INSTANCE_DEREGISTERED';
export const APPLICATION_INSTANCE_HEALTH_CHANGED =
  'APPLICATION_INSTANCE_HEALTH_CHANGED';
export const SAP_SYSTEM_DEREGISTERED = 'SAP_SYSTEM_DEREGISTERED';
export const SAP_SYSTEM_RESTORED = 'SAP_SYSTEM_RESTORED';
export const SAP_SYSTEM_UPDATED = 'SAP_SYSTEM_UPDATED';

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
} = sapSystemsListSlice.actions;

export default sapSystemsListSlice.reducer;
