import { getCatalog } from '@state/selectors/catalog';
import { getCluster, getClusterHosts } from '@state/selectors/cluster';

export const getLastExecution =
  (groupID) =>
  ({ lastExecutions }) =>
    lastExecutions[groupID];

export const getLastExecutionData = (groupID) => (state) => {
  const clusterHosts = getClusterHosts(groupID)(state);
  const cluster = getCluster(groupID)(state);
  const catalog = getCatalog()(state);
  const lastExecution = getLastExecution(groupID)(state) || {};

  return {
    clusterHosts,
    cluster,
    catalog,
    lastExecution,
  };
};
