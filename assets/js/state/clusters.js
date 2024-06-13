import { createAction, createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  clusters: [],
};

export const clustersListSlice = createSlice({
  name: 'clustersList',
  initialState,
  reducers: {
    setClusters: (state, action) => {
      state.clusters = action.payload;
    },
    appendCluster: (state, action) => {
      state.clusters = [...state.clusters, action.payload];
    },
    updateCluster: (state, action) => {
      state.clusters = state.clusters.map((cluster) => {
        if (cluster.id === action.payload.id) {
          cluster = { ...cluster, ...action.payload };
        }
        return cluster;
      });
    },
    addTagToCluster: (state, action) => {
      state.clusters = state.clusters.map((cluster) => {
        if (cluster.id === action.payload.id) {
          cluster.tags = [...cluster.tags, ...action.payload.tags];
        }
        return cluster;
      });
    },
    removeTagFromCluster: (state, action) => {
      state.clusters = state.clusters.map((cluster) => {
        if (cluster.id === action.payload.id) {
          cluster.tags = cluster.tags.filter(
            (tag) => tag.value !== action.payload.tags[0].value
          );
        }
        return cluster;
      });
    },
    updateSelectedChecks: (state, action) => {
      state.clusters = state.clusters.map((cluster) => {
        if (cluster.id === action.payload.clusterID) {
          cluster.selected_checks = action.payload.checks;
        }
        return cluster;
      });
    },
    updateClusterHealth: (state, action) => {
      state.clusters = state.clusters.map((cluster) => {
        if (cluster.id === action.payload.cluster_id) {
          cluster.health = action.payload.health;
        }
        return cluster;
      });
    },
    startClustersLoading: (state) => {
      state.loading = true;
    },
    stopClustersLoading: (state) => {
      state.loading = false;
    },
    updateCibLastWritten: (state, action) => {
      const {
        payload: { cluster_id, cib_last_written },
      } = action;
      state.clusters = state.clusters.map((cluster) => {
        if (cluster.id === cluster_id) {
          return { ...cluster, cib_last_written };
        }
        return cluster;
      });
    },
    removeCluster: (state, { payload: { id } }) => {
      state.clusters = state.clusters.filter((cluster) => cluster.id !== id);
    },
  },
});

export const CLUSTER_REGISTERED = 'CLUSTER_REGISTERED';
export const CLUSTER_CIB_LAST_WRITTEN_UPDATED =
  'CLUSTER_CIB_LAST_WRITTEN_UPDATED';
export const CLUSTER_DETAILS_UPDATED = 'CLUSTER_DETAILS_UPDATED';
export const CLUSTER_DEREGISTERED = 'CLUSTER_DEREGISTERED';
export const CLUSTER_RESTORED = 'CLUSTER_RESTORED';
export const CLUSTER_CHECKS_SELECTED = 'CLUSTER_CHECKS_SELECTED';
export const CLUSTER_HEALTH_CHANGED = 'CLUSTER_HEALTH_CHANGED';

export const clusterRegistered = createAction(CLUSTER_REGISTERED);
export const clusterDetailsUpdated = createAction(CLUSTER_DETAILS_UPDATED);
export const clusterHealthChanged = createAction(CLUSTER_HEALTH_CHANGED);
export const clusterCibLastWrittenUpdated = createAction(
  CLUSTER_CIB_LAST_WRITTEN_UPDATED
);
export const clusterDeregistered = createAction(CLUSTER_DEREGISTERED);
export const clusterRestored = createAction(CLUSTER_RESTORED);
export const checksSelected = createAction(CLUSTER_CHECKS_SELECTED);

export const {
  setClusters,
  appendCluster,
  updateCluster,
  addTagToCluster,
  removeTagFromCluster,
  updateSelectedChecks,
  updateChecksResults,
  updateClusterHealth,
  updateCibLastWritten,
  startClustersLoading,
  stopClustersLoading,
  removeCluster,
} = clustersListSlice.actions;

export default clustersListSlice.reducer;
