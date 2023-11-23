import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { isValidProvider, isValidTargetType } from '@lib/model';
import { isValidClusterType } from '@lib/model/clusters';
import { getCatalog } from '@state/selectors/catalog';
import { updateCatalog } from '@state/actions/catalog';
import ChecksCatalog from './ChecksCatalog';

const buildUpdateCatalogAction = (provider, targetType, clusterType) => {
  const payload = {
    ...(isValidProvider(provider) ? { provider } : {}),
    ...(isValidTargetType(targetType) ? { target_type: targetType } : {}),
    ...(isValidClusterType(clusterType) ? { cluster_type: clusterType } : {}),
  };

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
      updateCatalog={({
        selectedProvider,
        selectedTargetType,
        selectedClusterType,
      }) =>
        dispatch(
          buildUpdateCatalogAction(
            selectedProvider,
            selectedTargetType,
            selectedClusterType
          )
        )
      }
    />
  );
}

export default ChecksCatalogPage;
