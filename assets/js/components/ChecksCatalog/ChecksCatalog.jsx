/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { groupBy } from '@lib/lists';

import { getCatalog } from '@state/selectors/catalog';
import { updateCatalog } from '@state/actions/catalog';
import {
  providerData,
  checkProviderExists,
} from '@components/ProviderLabel/ProviderLabel';
import PageHeader from '@components/PageHeader';
import Accordion from '@components/Accordion';
import CatalogContainer from './CatalogContainer';
import CheckItem from './CheckItem';
import ProviderSelection from './ProviderSelection';

const ALL_FILTER = 'all';
const ALL_FILTER_TEXT = 'All';
const updatedProvider = {
  [ALL_FILTER]: { label: ALL_FILTER_TEXT },
  ...providerData,
};

const buildUpdateCatalogAction = (provider) => {
  const payload = checkProviderExists(provider) ? { provider } : {};
  return updateCatalog(payload);
};

// eslint-disable-next-line import/prefer-default-export
function ChecksCatalog() {
  const dispatch = useDispatch();
  const [selectedProvider, setProviderSelected] = useState(ALL_FILTER);

  const {
    data: catalogData,
    error: catalogError,
    loading,
  } = useSelector(getCatalog());

  useEffect(() => {
    dispatch(buildUpdateCatalogAction(selectedProvider));
  }, [dispatch, selectedProvider]);
  return (
    <>
      <div className="flex">
        <PageHeader className="font-bold">Checks catalog</PageHeader>
        <ProviderSelection
          className="ml-auto"
          providers={Object.keys(updatedProvider)}
          selected={selectedProvider}
          onChange={setProviderSelected}
        />
      </div>
      <CatalogContainer
        onRefresh={() => dispatch(buildUpdateCatalogAction(selectedProvider))}
        isCatalogEmpty={catalogData.length === 0}
        catalogError={catalogError}
        loading={loading}
      >
        <div>
          {Object.entries(groupBy(catalogData, 'group')).map(
            ([group, checks], idx) => (
              <ul key={idx}>
                <Accordion
                  defaultOpen
                  className="check-group mb-4"
                  header={group}
                >
                  {checks.map((check) => (
                    <CheckItem
                      key={check.id}
                      checkID={check.id}
                      premium={check.premium}
                      description={check.description}
                      remediation={check.remediation}
                    />
                  ))}
                </Accordion>
              </ul>
            )
          )}
        </div>
      </CatalogContainer>
    </>
  );
}

export default ChecksCatalog;
