import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  hosts: [],
};


export const hostsListSlice = createSlice({
  name: 'hostsList',
  initialState,
  reducers: {
    setHosts: (state, action) => {
      state.hosts = action.payload;
    },
    appendHost: (state, action) => {
      state.hosts = [...state.hosts, action.payload];
    },
    setHeartbeatPassing: (state, action) => {
      state.hosts = state.hosts.map((host) => {
        if (host.id === action.payload.id_host) {
          host.heartbeat = "passing";
        }
        return host;
      });
    },
    setHeartbeatCritical: (state, action) => {
      state.hosts = state.hosts.map((host) => {
        if (host.id === action.payload.id_host) {
          host.heartbeat = "critical";
        }
        return host;
      });
    },
    startLoading: (state) => {
      state.loading = true;
    },
    stopLoading: (state) => {
      state.loading = false;
    },
  },
});

export const { setHosts, appendHost, startLoading, stopLoading, setHeartbeatPassing, setHeartbeatCritical } =
  hostsListSlice.actions;

export default hostsListSlice.reducer;
