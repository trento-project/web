import React, { useEffect, useState } from 'react';
import { groupBy } from 'lodash';

import {
  providers,
  targetTypes,
  TARGET_HOST,
  TARGET_CLUSTER,
} from '@lib/model';
import { clusterTypes, getClusterTypeLabel } from '@lib/model/clusters';
import PageHeader from '@components/PageHeader';
import Accordion from '@components/Accordion';
import Select, { OPTION_ALL } from '@components/Select';
import ProviderLabel from '@components/ProviderLabel';
import TargetIcon from '@components/TargetIcon';
import CatalogContainer from './CatalogContainer';
import CheckItem from './CheckItem';

const providerOptionRenderer = (provider) => (
  <ProviderLabel provider={provider} />
);
const targetTypeOptionRenderer = (targetType) => (
  <TargetIcon targetType={targetType} className="inline mr-2 h-4">
    {targetType === TARGET_CLUSTER && 'Clusters'}
    {targetType === TARGET_HOST && 'Hosts'}
  </TargetIcon>
);

function ChecksCatalog({ catalogData, catalogError, loading, updateCatalog }) {
  const [selectedProvider, setProviderSelected] = useState(OPTION_ALL);
  const [selectedTargetType, setSelectedTargetType] = useState(OPTION_ALL);
  const [selectedClusterType, setSelectedClusterType] = useState(OPTION_ALL);

  useEffect(() => {
    updateCatalog({
      selectedProvider,
      selectedTargetType,
      selectedClusterType,
    });
  }, [selectedProvider, selectedTargetType, selectedClusterType]);

  return (
    <>
      <div className="flex items-center space-x-4">
        <PageHeader className="font-bold flex-1 w-64 pb-4">
          Checks catalog
        </PageHeader>
        <Select
          optionsName="targets"
          className="ml-auto"
          options={[OPTION_ALL, ...targetTypes]}
          renderOption={targetTypeOptionRenderer}
          value={selectedTargetType}
          onChange={setSelectedTargetType}
        />
        <Select
          optionsName="cluster types"
          className="ml-auto"
          options={[OPTION_ALL, ...clusterTypes]}
          renderOption={getClusterTypeLabel}
          value={selectedClusterType}
          onChange={setSelectedClusterType}
        />
        <Select
          optionsName="providers"
          className="ml-auto"
          options={[OPTION_ALL, ...providers]}
          renderOption={providerOptionRenderer}
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
