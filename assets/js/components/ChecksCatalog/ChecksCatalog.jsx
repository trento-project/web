import React, { useEffect, useState } from 'react';
import { groupBy } from 'lodash';

import { PROVIDERS } from '@lib/model';
import PageHeader from '@components/PageHeader';
import Accordion from '@components/Accordion';
import Select, { OPTION_ALL } from '@components/Select';
import ProviderLabel from '@components/ProviderLabel';
import CatalogContainer from './CatalogContainer';
import CheckItem from './CheckItem';

const providerOptionRenderer = (provider) => (
  <ProviderLabel provider={provider} />
);

function ChecksCatalog({ catalogData, catalogError, loading, updateCatalog }) {
  const [selectedProvider, setProviderSelected] = useState(OPTION_ALL);

  useEffect(() => {
    updateCatalog(selectedProvider);
  }, [selectedProvider]);

  return (
    <>
      <div className="flex">
        <PageHeader className="font-bold">Checks catalog</PageHeader>
        <Select
          optionsName="providers"
          className="ml-auto"
          options={PROVIDERS}
          withAllOption
          optionRenderer={providerOptionRenderer}
          value={selectedProvider}
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
