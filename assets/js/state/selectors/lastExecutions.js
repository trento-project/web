import { getCatalog } from '@state/selectors/catalog';
import { getCluster, getClusterHosts } from '@state/selectors/cluster';

export const getLastExecution =
  (groupID) =>
  ({ lastExecutions }) =>
    lastExecutions[groupID];

const addHostnameToAgentsCheckResults = (
  executionData = {},
  clusterHosts = []
) => {
  const { data } = executionData;
  const { check_results = [] } = data || {};

  if (!data) {
    return executionData;
  }

  return {
    ...executionData,
    data: {
      ...data,
      check_results: check_results?.map((checkResult) => ({
        ...checkResult,
        agents_check_results: checkResult?.agents_check_results.map(
          (target) => ({
            ...target,
            hostname: clusterHosts.find(({ id }) => target.agent_id === id)
              ?.hostname,
          })
        ),
      })),
    },
  };
};

export const getLastExecutionData = (groupID) => (state) => {
  const clusterHosts = getClusterHosts(groupID)(state);
  const cluster = getCluster(groupID)(state);
  const catalog = getCatalog()(state);
  const lastExecution = getLastExecution(groupID)(state) || null;

  const enrichedExecution = lastExecution
    ? addHostnameToAgentsCheckResults(lastExecution, clusterHosts)
    : {};

  return {
    clusterHosts,
    cluster,
    catalog,
    lastExecution: enrichedExecution,
  };
};
