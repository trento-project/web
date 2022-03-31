import { createSlice } from '@reduxjs/toolkit';

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
    updateChecksResults: (state, action) => {
      state.clusters = state.clusters.map((cluster) => {
        if (cluster.id === action.payload.cluster_id) {
          cluster.checks_results = [
            ...cluster.checks_results.filter((check_result) => {
              return check_result.host_id !== action.payload.host_id;
            }),
            ...action.payload.checks_results,
          ];
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
  },
});

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
} = clustersListSlice.actions;

export default clustersListSlice.reducer;
