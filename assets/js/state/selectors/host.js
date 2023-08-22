import { get } from 'lodash';
import { createSelector } from '@reduxjs/toolkit';

export const getHost = (id) => (state) =>
  state.hostsList.hosts.find((host) => host.id === id);

export const getHostSelectedChecks = createSelector(
  [(state, hostID) => getHost(hostID)(state)],
  (host) => get(host, 'selected_checks', [])
);
