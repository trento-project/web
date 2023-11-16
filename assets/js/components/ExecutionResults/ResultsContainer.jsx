import React from 'react';
import { EOS_ERROR } from 'eos-icons-react';

import NotificationBox from '@components/NotificationBox';

import ChecksSelectionHints from './ChecksSelectionHints';

function ResultsContainer({
  error,
  errorContent,
  children,
  targetID,
  targetType,
  hasAlreadyChecksResults,
  selectedChecks = [],
  hosts = [],
  onContentRefresh = () => {},
  onStartExecution = () => {},
}) {
  if (error) {
    return (
      <NotificationBox
        icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
        text={errorContent}
        buttonText="Try again"
        buttonOnClick={onContentRefresh}
      />
    );
  }

  if (!hasAlreadyChecksResults) {
    return (
      <ChecksSelectionHints
        targetID={targetID}
        targetType={targetType}
        selectedChecks={selectedChecks}
        hosts={hosts}
        onStartExecution={onStartExecution}
      />
    );
  }
  return children;
}

export default ResultsContainer;
