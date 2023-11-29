import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { pickBy } from 'lodash';

import { getCatalog } from '@state/selectors/catalog';
import { updateCatalog } from '@state/catalog';
import { OPTION_ALL } from '@common/Select';
import ChecksCatalog from './ChecksCatalog';

const buildUpdateCatalogAction = (selectedFilters) =>
  updateCatalog(pickBy(selectedFilters, (value) => value !== OPTION_ALL));

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
          buildUpdateCatalogAction({
            provider: selectedProvider,
            target_type: selectedTargetType,
            cluster_type: selectedClusterType,
          })
        )
      }
    />
  );
}

export default ChecksCatalogPage;
