import { getCatalog } from '@state/selectors/catalog';
import { getCluster, getClusterHostNames } from '@state/selectors/cluster';

export const getLastExecution =
  (groupID) =>
  ({ lastExecutions }) =>
    lastExecutions[groupID];

export const getLastExecutionData = (groupID) => (state) => {
  const hostnames = getClusterHostNames(groupID)(state);
  const cluster = getCluster(groupID)(state);
  const catalog = getCatalog()(state);
  const lastExecution = getLastExecution(groupID)(state) || {};

  return {
    hostnames,
    cluster,
    catalog,
    lastExecution,
  };
};
