import React from 'react';

import ChecksNotFound from '@static/checks-not-found.svg';
import ConnectionErrorAntenna from '@static/connection-error-antenna.svg';

import NotificationBox from '@common/NotificationBox';
import LoadingBox from '@common/LoadingBox';

function CatalogContainer({
  onClear = () => {},
  onRefresh = () => {},
  withResetFilters = false,
  empty = false,
  catalogError = null,
  loading = false,
  children,
}) {
  if (loading) {
    return <LoadingBox text="Loading checks catalog..." />;
  }

  if (catalogError) {
    return (
      <NotificationBox
        icon={
          <img
            src={ConnectionErrorAntenna}
            className="m-auto w-48"
            alt="Connection error"
          />
        }
        title="Connection Error"
        text={catalogError}
        buttonText="Try again"
        buttonOnClick={onRefresh}
      />
    );
  }

  if (empty) {
    return (
      <NotificationBox
        icon={
          <img
            src={ChecksNotFound}
            className="m-auto w-48"
            alt="Checks not found"
          />
        }
        title="No Checks Found"
        text="Checks Catalog is empty."
        buttonText={withResetFilters ? 'Reset filters' : null}
        buttonOnClick={onClear}
      />
    );
  }

  return children;
}

export default CatalogContainer;
