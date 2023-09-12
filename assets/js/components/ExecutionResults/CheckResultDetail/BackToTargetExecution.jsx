import React from 'react';

import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';

import BackButton from '@components/BackButton';

function BackToTargetExecution({ targetID, targetType }) {
  let targetExecutionURL;
  switch (targetType) {
    case TARGET_CLUSTER:
      targetExecutionURL = `/clusters/${targetID}/executions/last`;
      break;
    case TARGET_HOST:
      targetExecutionURL = `/hosts/${targetID}/executions/last`;
      break;
    default:
      return null;
  }
  return (
    <BackButton url={targetExecutionURL}>Back to Check Results</BackButton>
  );
}

export default BackToTargetExecution;
