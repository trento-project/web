import React from 'react';

import NotificationBox from '@components/NotificationBox';
import LoadingBox from '@components/LoadingBox';

import { EOS_ERROR } from 'eos-icons-react';

function CatalogContainer({
  onRefresh = () => {},
  isCatalogEmpty = false,
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

  if (isCatalogEmpty) {
    return (
      <NotificationBox
        icon={<EOS_ERROR className="m-auto" color="red" size="xl" />}
        text="Checks catalog is empty."
        buttonText="Try again"
        buttonOnClick={onRefresh}
      />
    );
  }

  return children;
};

export default CatalogContainer;
