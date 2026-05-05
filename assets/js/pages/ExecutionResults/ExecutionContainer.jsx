// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import LoadingBox from '@common/LoadingBox';

function ExecutionContainer({
  catalogLoading = false,
  executionLoading = false,
  executionStarted = true,
  executionRunning = false,
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
