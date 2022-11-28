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
      state.hosts = [...state.hosts, action.payload].sort(
        (a, b) => (a.hostname > b.hostname ? 1 : -1),
      );
    },
    updateHost: (state, action) => {
      state.hosts = state.hosts.map((host) => {
        if (host.id === action.payload.id) {
          host = { ...host, ...action.payload };
        }
        return host;
      });
    },
    addTagToHost: (state, action) => {
      state.hosts = state.hosts.map((host) => {
        if (host.id === action.payload.id) {
          host.tags = [...host.tags, ...action.payload.tags];
        }
        return host;
      });
    },
    removeTagFromHost: (state, action) => {
      state.hosts = state.hosts.map((host) => {
        if (host.id === action.payload.id) {
          host.tags = host.tags.filter(
            (tag) => tag.value !== action.payload.tags[0].value,
          );
        }
        return host;
      });
    },
    setHeartbeatPassing: (state, action) => {
      state.hosts = state.hosts.map((host) => {
        if (host.id === action.payload.id) {
          host.heartbeat = 'passing';
        }
        return host;
      });
    },
    setHeartbeatCritical: (state, action) => {
      state.hosts = state.hosts.map((host) => {
        if (host.id === action.payload.id) {
          host.heartbeat = 'critical';
        }
        return host;
      });
    },
    startHostsLoading: (state) => {
      state.loading = true;
    },
    stopHostsLoading: (state) => {
      state.loading = false;
    },
  },
});

export const {
  setHosts,
  appendHost,
  updateHost,
  addTagToHost,
  removeTagFromHost,
  startHostsLoading,
  stopHostsLoading,
  setHeartbeatPassing,
  setHeartbeatCritical,
} = hostsListSlice.actions;

export default hostsListSlice.reducer;
