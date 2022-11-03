import React from 'react';

import BackButton from '@components/BackButton';

const defaultFetch = () => {};

const ExecutionResults = ({
  clusterID,
  executionID,
  onFetch = defaultFetch,
}) => {
  return (
    <div>
      <BackButton url={`/clusters/${clusterID}`}>
        Back to Cluster Details
      </BackButton>
      {executionID}
    </div>
  );
};

export default ExecutionResults;
