import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  HANA_SCALE_UP,
  HANA_SCALE_UP_PERF_OPT,
  HANA_SCALE_UP_COST_OPT,
} from '@lib/model/clusters';

import { pickBy, values } from 'lodash';
import { getCatalog } from '@state/selectors/catalog';
import { updateCatalog } from '@state/catalog';
import { OPTION_ALL } from '@common/Select';

import ChecksCatalog from './ChecksCatalog';

const isSomeFilter = (value) => value !== OPTION_ALL;

const modifyHanaScaleUpClusterType = (clusterType) => {
  switch (clusterType) {
    case HANA_SCALE_UP_PERF_OPT:
    case HANA_SCALE_UP_COST_OPT:
      return HANA_SCALE_UP;
    default:
      return clusterType;
  }
};

const buildUpdateCatalogAction = (selectedFilters) => {
  const hasFilters = values(selectedFilters).some(isSomeFilter);
  const modifiedSelectedFilters = {
    ...selectedFilters,
    cluster_type: modifyHanaScaleUpClusterType(selectedFilters.cluster_type),
  };

  console.log('selectedFilters', selectedFilters);

  const payload = {
    ...pickBy(modifiedSelectedFilters, isSomeFilter),
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
        selectedHanaScaleUpScenario,
      }) =>
        dispatch(
          buildUpdateCatalogAction({
            provider: selectedProvider,
            target_type: selectedTargetType,
            cluster_type: selectedClusterType,
            hana_scenario: selectedHanaScaleUpScenario,
          })
        )
      }
    />
  );
}

export default ChecksCatalogPage;
