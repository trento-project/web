/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { groupBy } from '@lib/lists';

import { getCatalog } from '@state/selectors/catalog';
import { updateCatalog } from '@state/actions/catalog';
import {
  providerData,
  getLabels,
  getProviderByLabel,
} from '../ProviderLabel/ProviderLabel';
import CatalogContainer from './CatalogContainer';
import CheckItem from './CheckItem';
import ProviderSelection from './ProviderSelection';

const ALL_FILTER = 'All';
const updatedProvider = {
  default: { label: ALL_FILTER },
  ...providerData,
};
const providerLabels = getLabels(updatedProvider);

// eslint-disable-next-line import/prefer-default-export
export function ChecksCatalogNew() {
  const dispatch = useDispatch();
  const [selectedProvider, setProviderSelected] = useState(ALL_FILTER);

  const {
    data: catalogData,
    error: catalogError,
    loading,
  } = useSelector(getCatalog());

  useEffect(() => {
    const apiParams =
      selectedProvider === ALL_FILTER
        ? {}
        : { provider: getProviderByLabel(updatedProvider, selectedProvider) };

    dispatch(updateCatalog(apiParams));
  }, [dispatch, selectedProvider]);
  return (
    <div>
      <CatalogContainer
        onRefresh={() =>
          dispatch(
            updateCatalog({
              provider:
                getProviderByLabel(providerData, selectedProvider) || null,
            })
          )
        }
        isCatalogEmpty={catalogData.length === 0}
        catalogError={catalogError}
        loading={loading}
      >
        <ProviderSelection
          providers={providerLabels}
          selected={selectedProvider}
          onChange={setProviderSelected}
        />
        <div>
          {Object.entries(groupBy(catalogData, 'group')).map(
            ([group, checks], idx) => (
              <div
                key={idx}
                className="check-group bg-white shadow overflow-hidden sm:rounded-md mb-8"
              >
                <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {group}
                  </h3>
                </div>
                <ul className="divide-y divide-gray-200">
                  {checks.map((check) => (
                    <CheckItem
                      key={check.id}
                      checkID={check.id}
                      premium={check.premium}
                      description={check.description}
                      remediation={check.remediation}
                    />
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      </CatalogContainer>
    </div>
  );
}
