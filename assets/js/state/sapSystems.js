import { createSlice } from '@reduxjs/toolkit';
import { maybeUpdateInstanceHealth } from './instances';

const initialState = {
  loading: false,
  sapSystems: [],
  applicationInstances: [], // TODO: is this separation needed? Can it be just encapsulated into previous sapSystems?
  databaseInstances: [],
};

export const sapSystemsListSlice = createSlice({
  name: 'sapSystemsList',
  initialState,
  reducers: {
    // Here the payload comes from /api/sap_systems API when the application loads
    // Note that each sap system item has an application_instances and a database_instances properties
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
    appendApplicationInstance: (state, action) => {
      state.applicationInstances = [
        ...state.applicationInstances,
        action.payload,
      ];
    },
    // When a new DatabaseInstanceRegistered comes in,
    // it need to be appended to the list of the database instances of the relative sap system
    appendDatabaseInstanceToSapSystem: (state, action) => {
      state.databaseInstances = [...state.databaseInstances, action.payload];
    },
    updateSapSystemHealth: (state, action) => {
      state.sapSystems = state.sapSystems.map((sapSystem) => {
        if (sapSystem.id === action.payload.id) {
          sapSystem.health = action.payload.health;
        }
        return sapSystem;
      });
    },
    updateApplicationInstanceHealth: (state, action) => {
      state.applicationInstances = state.applicationInstances.map(
        (instance) => {
          return maybeUpdateInstanceHealth(action.payload, instance);
        }
      );
    },
    updateSAPSystemDatabaseInstanceHealth: (state, action) => {
      state.databaseInstances = state.databaseInstances.map((instance) => {
        return maybeUpdateInstanceHealth(action.payload, instance);
      });
    },
    addTagToSAPSystem: (state, action) => {
      state.sapSystems = state.sapSystems.map((sapSystem) => {
        console.log('sapSystem: ', sapSystem);
        if (sapSystem.id === action.payload.id) {
          sapSystem.tags = [...sapSystem.tags, ...action.payload.tags];
        }
        return sapSystem;
      });
    },
    removeTagFromSAPSystem: (state, action) => {
      state.sapSystems = state.sapSystems.map((sapSystem) => {
        console.log('sapSystem: ', sapSystem);
        if (sapSystem.id === action.payload.id) {
          sapSystem.tags = sapSystem.tags.filter(
            (tag) => tag.value !== action.payload.tags[0].value
          );
        }
        return sapSystem;
      });
    },
  },
});

export const {
  startSapSystemsLoading,
  stopSapSystemsLoading,
  setSapSystems,
  appendSapsystem,
  appendApplicationInstance,
  appendDatabaseInstanceToSapSystem,
  updateSapSystemHealth,
  updateApplicationInstanceHealth,
  updateSAPSystemDatabaseInstanceHealth,
  addTagToSAPSystem,
  removeTagFromSAPSystem,
} = sapSystemsListSlice.actions;

export default sapSystemsListSlice.reducer;
