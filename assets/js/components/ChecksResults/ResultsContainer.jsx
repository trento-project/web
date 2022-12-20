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
  usingNewChecksEngine = false,
  onCatalogRefresh = () => {},
  
}) {
  console.log("Has already ...", hasAlreadyChecksResults)
  console.log("new checks container 2", usingNewChecksEngine)
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

  // FIX ME , hasAlreadyChecksResults is always true and needs to be false --> need to validate checks before
  if (!hasAlreadyChecksResults) {
    return (
      <ChecksSelectionHints
        clusterId={clusterID}
        selectedChecks={selectedChecks}
        usingNewChecksEngine={usingNewChecksEngine}
      />
    );
  }
  return children;
}

export default ResultsContainer;
