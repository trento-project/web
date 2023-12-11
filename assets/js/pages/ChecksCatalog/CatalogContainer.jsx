import React from 'react';

import { EOS_ERROR } from 'eos-icons-react';
import ChecksNotFound from '@static/checks-not-found.svg';

import NotificationBox from '@common/NotificationBox';
import LoadingBox from '@common/LoadingBox';

function CatalogContainer({
  onRefresh = () => {},
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
        icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
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
        buttonText="Try again"
        buttonOnClick={onRefresh}
      />
    );
  }

  return children;
}

export default CatalogContainer;
