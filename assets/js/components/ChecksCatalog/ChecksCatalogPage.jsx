import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { isValidProvider, isValidTargetType } from '@lib/model';
import { isValidClusterType } from '@lib/model/clusters';
import { isValidEnsaVersion } from '@lib/model/sapSystems';
import { getCatalog } from '@state/selectors/catalog';
import { updateCatalog } from '@state/actions/catalog';
import ChecksCatalog from './ChecksCatalog';

const buildUpdateCatalogAction = (
  provider,
  targetType,
  clusterType,
  ensaVersion
) => {
  const payload = {
    ...(isValidProvider(provider) ? { provider } : {}),
    ...(isValidTargetType(targetType) ? { target_type: targetType } : {}),
    ...(isValidClusterType(clusterType) ? { cluster_type: clusterType } : {}),
    ...(isValidEnsaVersion(ensaVersion) ? { ensa_version: ensaVersion } : {}),
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
        selectedEnsaVersion,
      }) =>
        dispatch(
          buildUpdateCatalogAction(
            selectedProvider,
            selectedTargetType,
            selectedClusterType,
            selectedEnsaVersion
          )
        )
      }
    />
  );
}

export default ChecksCatalogPage;
