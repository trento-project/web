import React from 'react';
import { EOS_ERROR } from 'eos-icons-react';

import NotificationBox from '@components/NotificationBox';

import ChecksSelectionHints from './ChecksSelectionHints';

const ResultsContainer = ({
  catalogError,
  children,
  clusterID,
  hasAlreadyChecksResults,
  selectedChecks = [],
  onCatalogRefresh = () => {},
}) => {
  if (catalogError) {
    return (
      <NotificationBox
        icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
        text={catalogError}
        buttonText="Try again"
        buttonOnClick={onCatalogRefresh}
      />
    );
  } else if (!hasAlreadyChecksResults) {
    return (
      <ChecksSelectionHints
        clusterId={clusterID}
        selectedChecks={selectedChecks}
      />
    );
  } else {
    return children;
  }
};

export default ResultsContainer;
