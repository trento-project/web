import React from 'react';

import LoadingBox from '@components/LoadingBox';

function ExecutionContainer({
  catalogLoading,
  executionLoading,
  executionStarted,
  executionRunning,
  children,
}) {
  if (catalogLoading || executionLoading) {
    return <LoadingBox text="Loading checks execution..." />;
  }

  if (!executionStarted) {
    return <LoadingBox text="Checks execution starting..." />;
  }

  if (executionRunning) {
    return <LoadingBox text="Checks execution running..." />;
  }

  return children;
}

export default ExecutionContainer;
