import { createSelector } from '@reduxjs/toolkit';

import { getCatalog } from '@state/selectors/catalog';
import { getCluster, getClusterHosts } from '@state/selectors/cluster';

const getLastExecutions = ({ lastExecutions }) => lastExecutions;

export const getLastExecution = (groupID) =>
  createSelector(
    [getLastExecutions],
    (lastExecutions) => lastExecutions[groupID]
  );

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

export const getLastExecutionData = createSelector(
  [
    (state, groupID) => getClusterHosts(groupID)(state),
    (state, groupID) => getCluster(groupID)(state),
    (state) => getCatalog()(state),
    (state, groupID) => getLastExecution(groupID)(state),
  ],
  (clusterHosts, cluster, catalog, lastExecution) => {
    const enrichedExecution = lastExecution
      ? addHostnameToAgentsCheckResults(lastExecution, clusterHosts)
      : {};

    return {
      clusterHosts,
      cluster,
      catalog,
      lastExecution: enrichedExecution,
    };
  }
);
