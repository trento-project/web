import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { pickBy, values } from 'lodash';

import { getCatalog } from '@state/selectors/catalog';
import { updateCatalog } from '@state/catalog';
import { OPTION_ALL } from '@common/Select';

import ChecksCatalog from './ChecksCatalog';
import useAIContext from '@hooks/useAIContext';

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

  // Provide context for AI assistant
  const aiContext = useMemo(
    () => ({
      page: 'Checks Catalog',
      description: 'Overview of available checks with current filters applied',
      data: {
        totalChecks: completeCatalog?.length || 0,
        filteredChecks: filteredCatalog?.length || 0,
        hasFilters: !!filteredCatalog,
      },
    }),
    [completeCatalog, filteredCatalog]
  );
  useAIContext(aiContext);

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
        selectedArchitecture,
      }) =>
        dispatch(
          buildUpdateCatalogAction({
            provider: selectedProvider,
            target_type: selectedTargetType,
            cluster_type: selectedClusterType,
            hana_scenario: selectedHanaScenario,
            arch: selectedArchitecture,
          })
        )
      }
    />
  );
}

export default ChecksCatalogPage;
