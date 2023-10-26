import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getCatalog } from '@state/selectors/catalog';
import { updateCatalog } from '@state/actions/catalog';
import { checkProviderExists } from '@components/ProviderLabel/ProviderLabel';
import ChecksCatalog from './ChecksCatalog';

const buildUpdateCatalogAction = (provider) => {
  const payload = checkProviderExists(provider)
    ? { provider, target_type: 'cluster' }
    : {};
  return updateCatalog(payload);
};

function ChecksCatalogPage() {
  const dispatch = useDispatch();

  const {
    data: catalogData,
    error: catalogError,
    loading,
  } = useSelector(getCatalog());

  return (
    <ChecksCatalog
      catalogData={catalogData}
      catalogError={catalogError}
      loading={loading}
      updateCatalog={(selectedProvider) =>
        dispatch(buildUpdateCatalogAction(selectedProvider))
      }
    />
  );
}

export default ChecksCatalogPage;
