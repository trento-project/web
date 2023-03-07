import React from 'react';
import { EOS_ERROR } from 'eos-icons-react';

import NotificationBox from '@components/NotificationBox';

import ChecksSelectionHints from './ChecksSelectionHints';

function ResultsContainer({
  error,
  errorContent,
  children,
  clusterID,
  hasAlreadyChecksResults,
  selectedChecks = [],
  hosts = [],
  onContentRefresh = () => {},
  onStartExecution = () => {},
}) {
  if (error) {
    return (
      <div className="bg-white rounded p-3 shadow">
        <NotificationBox
          icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
          text={errorContent}
          buttonText="Try again"
          buttonOnClick={onContentRefresh}
        />
      </div>
    );
  }

  if (!hasAlreadyChecksResults) {
    return (
      <ChecksSelectionHints
        clusterId={clusterID}
        selectedChecks={selectedChecks}
        hosts={hosts}
        onStartExecution={onStartExecution}
      />
    );
  }
  return children;
}

export default ResultsContainer;
