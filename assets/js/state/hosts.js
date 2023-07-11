import { createAction, createSlice } from '@reduxjs/toolkit';

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
      state.hosts = [...state.hosts, action.payload].sort((a, b) =>
        a.hostname > b.hostname ? 1 : -1
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
            (tag) => tag.value !== action.payload.tags[0].value
          );
        }
        return host;
      });
    },
    updateSelectedChecks: (state, action) => {
      state.hosts = state.hosts.map((host) => {
        if (host.id === action.payload.targetID) {
          host.selected_checks = action.payload.checks;
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
    setHostListDeregisterable: (state, { payload }) => {
      const ids = payload.map((host) => host.id);

      state.hosts = state.hosts.map((host) => {
        if (ids.includes(host.id)) {
          return { ...host, deregisterable: true };
        }

        return host;
      });
    },
    setHostNotDeregisterable: (state, action) => {
      state.hosts = state.hosts.map((host) => {
        if (host.id === action.payload.id) {
          return { ...host, deregisterable: false };
        }

        return host;
      });
    },
    setHostDeregistering: (state, action) => {
      state.hosts = state.hosts.map((host) => {
        if (host.id === action.payload.id) {
          return { ...host, deregistering: true };
        }
        return host;
      });
    },
    setHostNotDeregistering: (state, action) => {
      state.hosts = state.hosts.map((host) => {
        if (host.id === action.payload.id) {
          return { ...host, deregistering: false };
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
    removeHost: (state, { payload: { id } }) => {
      state.hosts = state.hosts.filter((host) => host.id !== id);
    },
  },
});

export const CHECK_HOST_IS_DEREGISTERABLE = 'CHECK_HOST_IS_DEREGISTERABLE';
export const CANCEL_CHECK_HOST_IS_DEREGISTERABLE =
  'CANCEL_CHECK_HOST_IS_DEREGISTERABLE';
export const HOST_DEREGISTERED = 'HOST_DEREGISTERED';
export const DEREGISTER_HOST = 'DEREGISTER_HOST';

export const checkHostIsDeregisterable = createAction(
  CHECK_HOST_IS_DEREGISTERABLE
);
export const cancelCheckHostIsDeregisterable = createAction(
  CANCEL_CHECK_HOST_IS_DEREGISTERABLE
);
export const deregisterHost = createAction(DEREGISTER_HOST);

export const {
  setHosts,
  appendHost,
  updateHost,
  addTagToHost,
  removeTagFromHost,
  updateSelectedChecks,
  setHeartbeatPassing,
  setHeartbeatCritical,
  setHostListDeregisterable,
  setHostNotDeregisterable,
  setHostDeregistering,
  setHostNotDeregistering,
  startHostsLoading,
  stopHostsLoading,
  removeHost,
} = hostsListSlice.actions;

export default hostsListSlice.reducer;
