import { createAction, createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  hosts: [],
};

const updateHostData = (hosts, hostID, data) =>
  hosts.map((host) => {
    if (host.id === hostID) {
      return { ...host, ...data };
    }
    return host;
  });

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
    updateHost: (state, { payload: host, payload: { id } }) => {
      state.hosts = updateHostData(state.hosts, id, host);
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
    updateSelectedChecks: (state, { payload: { hostID, checks } }) => {
      state.hosts = updateHostData(state.hosts, hostID, {
        selected_checks: checks,
      });
    },
    setHeartbeatPassing: (state, { payload: { id } }) => {
      state.hosts = updateHostData(state.hosts, id, { heartbeat: 'passing' });
    },
    setHeartbeatCritical: (state, { payload: { id } }) => {
      state.hosts = updateHostData(state.hosts, id, { heartbeat: 'critical' });
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
    setHostNotDeregisterable: (state, { payload: { id } }) => {
      state.hosts = updateHostData(state.hosts, id, { deregisterable: false });
    },
    setHostDeregistering: (state, { payload: { id } }) => {
      state.hosts = updateHostData(state.hosts, id, { deregistering: true });
    },
    unsetHostDeregistering: (state, { payload: { id } }) => {
      state.hosts = updateHostData(state.hosts, id, { deregistering: false });
    },
    updateSaptuneStatus: (state, { payload: { id, status } }) => {
      state.hosts = updateHostData(state.hosts, id, { saptune_status: status });
    },
    updateHostHealth: (state, { payload: { id, health } }) => {
      state.hosts = updateHostData(state.hosts, id, { health });
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

// eslint-disable-next-line no-undef
export const DEREGISTRATION_DEBOUNCE = config.deregistrationDebounce ?? 0;

export const HOST_REGISTERED = 'HOST_REGISTERED';
export const HOST_DETAILS_UPDATED = 'HOST_DETAILS_UPDATED';
export const HEARTBEAT_SUCCEDED = 'HEARTBEAT_SUCCEDED';
export const HEARTBEAT_FAILED = 'HEARTBEAT_FAILED';
export const CHECK_HOST_IS_DEREGISTERABLE = 'CHECK_HOST_IS_DEREGISTERABLE';
export const CANCEL_CHECK_HOST_IS_DEREGISTERABLE =
  'CANCEL_CHECK_HOST_IS_DEREGISTERABLE';
export const HOST_DEREGISTERED = 'HOST_DEREGISTERED';
export const HOST_RESTORED = 'HOST_RESTORED';
export const SAPTUNE_STATUS_UPDATED = 'SAPTUNE_STATUS_UPDATED';
export const HOST_HEALTH_CHANGED = 'HOST_HEALTH_CHANGED';
export const DEREGISTER_HOST = 'DEREGISTER_HOST';
export const HOST_SOFTWARE_UPDATES_DISCOVERY_COMPLETED =
  'HOST_SOFTWARE_UPDATES_DISCOVERY_COMPLETED';

export const hostRegistered = createAction(HOST_REGISTERED);
export const hostDetailsUpdated = createAction(HOST_DETAILS_UPDATED);
export const heartbeatSucceded = createAction(HEARTBEAT_SUCCEDED);
export const heartbeatFailed = createAction(HEARTBEAT_FAILED);
export const hostDeregisterd = createAction(HOST_DEREGISTERED);
export const hostRestored = createAction(HOST_RESTORED);
export const saptuneStatusUpdated = createAction(SAPTUNE_STATUS_UPDATED);
export const hostHelathChanged = createAction(HOST_HEALTH_CHANGED);
export const hostSoftwareUpdatesDiscoveryCompleted = createAction(
  HOST_SOFTWARE_UPDATES_DISCOVERY_COMPLETED
);

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
  unsetHostDeregistering,
  updateSaptuneStatus,
  updateHostHealth,
  startHostsLoading,
  stopHostsLoading,
  removeHost,
} = hostsListSlice.actions;

export default hostsListSlice.reducer;
