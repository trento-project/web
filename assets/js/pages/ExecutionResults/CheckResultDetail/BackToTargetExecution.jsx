import React from 'react';

import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';

import BackButton from '@common/BackButton';

function BackToTargetExecution({ targetID, targetType }) {
  const targetTypeToExecutionURL = {
    [TARGET_CLUSTER]: `/clusters/${targetID}/executions/last`,
    [TARGET_HOST]: `/hosts/${targetID}/executions/last`,
  };

  const targetExecutionURL = targetTypeToExecutionURL[targetType];

  return (
    targetExecutionURL && (
      <BackButton url={targetExecutionURL}>Back to Check Results</BackButton>
    )
  );
}

export default BackToTargetExecution;
