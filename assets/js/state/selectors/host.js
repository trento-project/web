import { get } from 'lodash';
import { createSelector } from '@reduxjs/toolkit';

export const getHost = (id) => (state) =>
  state.hostsList.hosts.find((host) => host.id === id);

export const getHostID = ({ id: hostID }) => hostID;

export const getHostSelectedChecks = createSelector(
  [(state, hostID) => getHost(hostID)(state)],
  (host) => get(host, 'selected_checks', [])
);

export const getHostIDs = createSelector(
  [(state) => state.hostsList.hosts],
  (hosts) => hosts.map(getHostID)
);
