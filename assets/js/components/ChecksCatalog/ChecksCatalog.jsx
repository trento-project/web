import React, { useEffect, useState } from 'react';
import { groupBy } from 'lodash';

import { providerData } from '@components/ProviderLabel/ProviderLabel';
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

function ChecksCatalog({ catalogData, catalogError, loading, updateCatalog }) {
  const [selectedProvider, setProviderSelected] = useState(ALL_FILTER);

  useEffect(() => {
    updateCatalog(selectedProvider);
  }, [selectedProvider]);

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
        onRefresh={() => updateCatalog(selectedProvider)}
        isCatalogEmpty={catalogData.length === 0}
        catalogError={catalogError}
        loading={loading}
      >
        <div>
          {Object.entries(groupBy(catalogData, 'group')).map(
            ([group, checks], index) => (
              <ul key={group}>
                <Accordion
                  defaultOpen={index === 0}
                  className="check-group mb-4"
                  header={group}
                >
                  {checks.map((check) => (
                    <CheckItem
                      key={check.id}
                      checkID={check.id}
                      premium={check.premium}
                      targetType={check.metadata?.target_type}
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
