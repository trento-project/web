import { get } from 'lodash';

const defaultEmptyArray = [];

export const getHost = (id) => (state) =>
  state.hostsList.hosts.find((host) => host.id === id);

export const getHostSelectedChecks = (hostID) => (state) => {
  const host = getHost(hostID)(state);
  return get(host, 'selected_checks', defaultEmptyArray);
};
