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
        startClustersLoading: (state) => {
            state.loading = true;
        },
        stopClustersLoading: (state) => {
            state.loading = false;
        },
    },
});

export const {
    setClusters,
    appendCluster,
    updateCluster,
    startClustersLoading,
    stopClustersLoading,
} = clustersListSlice.actions;

export default clustersListSlice.reducer;
