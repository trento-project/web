import { pipe, getOr, find } from 'lodash/fp';

const getUnitFileState = (host, unit) =>
  pipe(
    getOr([], 'systemd_units'),
    find({ name: unit }),
    getOr('unknown', 'unit_file_state')
  )(host);

export const canEnableUnit = (host, unit) =>
  getUnitFileState(host, unit) === 'disabled';

export const canDisableUnit = (host, unit) =>
  getUnitFileState(host, unit) === 'enabled';

// isOnlineInCluster returns true if the host in the cluster has
// a status that is not Offline: Online, Maintenance, Pending, etc
export const isOnlineInCluster = (host) =>
  getOr('Offline', 'status', host) !== 'Offline';
