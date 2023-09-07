import { createSelector } from '@reduxjs/toolkit';

import { getCatalog } from '@state/selectors/catalog';
import { getCluster, getClusterHosts } from '@state/selectors/cluster';
import { getHost } from '@state/selectors/host';
import { compact } from 'lodash';
import {
  isTargetCluster,
  isTargetHost,
} from '@components/ExecutionResults/checksUtils';

const getLastExecutions = ({ lastExecutions }) => lastExecutions;

export const getLastExecution = (groupID) =>
  createSelector(
    [getLastExecutions],
    (lastExecutions) => lastExecutions[groupID]
  );

const addHostnameToAgentsCheckResults = (
  executionData = {},
  targetHosts = []
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
            hostname: targetHosts.find(({ id }) => target.agent_id === id)
              ?.hostname,
          })
        ),
      })),
    },
  };
};

const getTargetHosts = (state, groupID, targetType) => {
  switch (true) {
    case isTargetCluster(targetType):
      return getClusterHosts(state, groupID);
    case isTargetHost(targetType):
      return compact([getHost(groupID)(state)]);
    default:
      return [];
  }
};

const getTarget = (state, groupID, targetType) => {
  switch (true) {
    case isTargetCluster(targetType):
      return getCluster(groupID)(state);
    case isTargetHost(targetType):
      return getHost(groupID)(state);
    default:
      return null;
  }
};

export const getLastExecutionData = createSelector(
  [
    (state, groupID, targetType) => getTargetHosts(state, groupID, targetType),
    (state, groupID, targetType) => getTarget(state, groupID, targetType),
    (state) => getCatalog()(state),
    (state, groupID) => getLastExecution(groupID)(state),
  ],
  (targetHosts, target, catalog, lastExecution) => {
    const enrichedExecution = lastExecution
      ? addHostnameToAgentsCheckResults(lastExecution, targetHosts)
      : {};

    return {
      targetHosts,
      target,
      catalog,
      lastExecution: enrichedExecution,
    };
  }
);
