import React from 'react';
import { EOS_ERROR } from 'eos-icons-react';

import NotificationBox from '@components/NotificationBox';

import ChecksSelectionHints from './ChecksSelectionHints';

function ResultsContainer({
  catalogError,
  children,
  clusterID,
  hasAlreadyChecksResults,
  selectedChecks = [],
  hosts = [],
  usingNewChecksEngine = false,
  onCatalogRefresh = () => {},
  onStartExecution = () => {},
}) {
  if (catalogError) {
    return (
      <NotificationBox
        icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
        text={catalogError}
        buttonText="Try again"
        buttonOnClick={onCatalogRefresh}
      />
    );
  }

  if (!hasAlreadyChecksResults) {
    return (
      <ChecksSelectionHints
        clusterId={clusterID}
        selectedChecks={selectedChecks}
        hosts={hosts}
        usingNewChecksEngine={usingNewChecksEngine}
        onStartExecution={onStartExecution}
      />
    );
  }
  return children;
}

export default ResultsContainer;
