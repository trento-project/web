import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { pickBy, values } from 'lodash';

import { getCatalog } from '@state/selectors/catalog';
import { updateCatalog } from '@state/catalog';
import { OPTION_ALL } from '@common/Select';

import ChecksCatalog from './ChecksCatalog';

const isSomeFilter = (value) => value !== OPTION_ALL;

const buildUpdateCatalogAction = (selectedFilters) => {
  const hasFilters = values(selectedFilters).some(isSomeFilter);
  const payload = {
    ...pickBy(selectedFilters, isSomeFilter),
    ...(hasFilters ? { filteredCatalog: true } : {}),
  };
  return updateCatalog(payload);
};

function ChecksCatalogPage() {
  const dispatch = useDispatch();

  const {
    data: completeCatalog,
    filteredCatalog,
    error: catalogError,
    loading,
  } = useSelector(getCatalog());

  return (
    <ChecksCatalog
      completeCatalog={completeCatalog}
      filteredCatalog={filteredCatalog}
      catalogError={catalogError}
      loading={loading}
      updateCatalog={({
        selectedProvider,
        selectedTargetType,
        selectedClusterType,
        selectedHanaScenario,
      }) =>
        dispatch(
          buildUpdateCatalogAction({
            provider: selectedProvider,
            target_type: selectedTargetType,
            cluster_type: selectedClusterType,
            hana_scenario: selectedHanaScenario,
          })
        )
      }
    />
  );
}

export default ChecksCatalogPage;
