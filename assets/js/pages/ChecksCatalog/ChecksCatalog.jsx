import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { groupBy } from 'lodash';

import {
  providers,
  targetTypes,
  TARGET_HOST,
  TARGET_CLUSTER,
} from '@lib/model';
import { clusterTypes, getClusterTypeLabel } from '@lib/model/clusters';
import { hasChecksForClusterType, hasChecksForTarget } from '@lib/model/checks';
import Accordion from '@common/Accordion';
import PageHeader from '@common/PageHeader';
import Pill from '@common/Pill';
import Select, { createOptionRenderer, OPTION_ALL } from '@common/Select';
import ProviderLabel from '@common/ProviderLabel';
import TargetIcon from '@common/TargetIcon';
import CatalogContainer from './CatalogContainer';
import CheckItem from './CheckItem';

const providerOptionRenderer = createOptionRenderer(
  'All providers',
  (provider) => <ProviderLabel provider={provider} />
);

const clusterTypeRenderer = createOptionRenderer(
  'All cluster types',
  (clusterType, disabled) => (
    <>
      {getClusterTypeLabel(clusterType)}
      {disabled && (
        <Pill
          size="xs"
          className="absolute right-2 bg-green-100 text-green-800"
        >
          Coming Soon
        </Pill>
      )}
    </>
  )
);

const targetTypeOptionRenderer = createOptionRenderer(
  'All targets',
  (targetType, disabled) => (
    <TargetIcon
      targetType={targetType}
      className={classNames('inline mr-2 h-4', {
        'fill-gray-400': disabled,
      })}
    >
      {targetType === TARGET_CLUSTER && 'Clusters'}
      {targetType === TARGET_HOST && 'Hosts'}
      {disabled && (
        <Pill
          size="xs"
          className="absolute right-2 bg-green-100 text-green-800"
        >
          Coming Soon
        </Pill>
      )}
    </TargetIcon>
  )
);

function ChecksCatalog({
  completeCatalog,
  filteredCatalog = completeCatalog,
  catalogError,
  loading,
  updateCatalog,
}) {
  const [selectedProvider, setProviderSelected] = useState(OPTION_ALL);
  const [selectedTargetType, setSelectedTargetType] = useState(OPTION_ALL);
  const [selectedClusterType, setSelectedClusterType] = useState(OPTION_ALL);

  const onTargetTypeChange = (targetType) => {
    if (targetType !== TARGET_CLUSTER) {
      setSelectedClusterType(OPTION_ALL);
    }
    setSelectedTargetType(targetType);
  };

  const filters = [
    {
      optionsName: 'targets',
      options: targetTypes.map((targetType) => ({
        value: targetType,
        disabled: !hasChecksForTarget(completeCatalog, targetType),
      })),
      renderOption: targetTypeOptionRenderer,
      value: selectedTargetType,
      onChange: onTargetTypeChange,
    },
    {
      optionsName: 'cluster-types',
      options: clusterTypes.map((clusterType) => ({
        value: clusterType,
        disabled: !hasChecksForClusterType(completeCatalog, clusterType),
      })),
      renderOption: clusterTypeRenderer,
      value: selectedClusterType,
      onChange: setSelectedClusterType,
      disabled: selectedTargetType !== TARGET_CLUSTER,
    },
    {
      optionsName: 'providers',
      options: providers,
      renderOption: providerOptionRenderer,
      value: selectedProvider,
      onChange: setProviderSelected,
    },
  ];

  useEffect(() => {
    updateCatalog({
      selectedProvider,
      selectedTargetType,
      selectedClusterType,
    });
  }, [selectedProvider, selectedTargetType, selectedClusterType]);

  const clearFilters = () => {
    setProviderSelected(OPTION_ALL);
    setSelectedTargetType(OPTION_ALL);
    setSelectedClusterType(OPTION_ALL);
  };

  return (
    <>
      <div className="flex items-center space-x-4">
        <PageHeader className="font-bold flex-1 w-64 pb-4">
          Checks catalog
        </PageHeader>
        {filters.map((filterProps) => (
          <Select
            key={filterProps.optionsName}
            className="ml-auto pb-4"
            {...filterProps}
            options={[OPTION_ALL, ...filterProps.options]}
          />
        ))}
      </div>
      <CatalogContainer
        onClear={clearFilters}
        onRefresh={() => updateCatalog(selectedProvider)}
        withResetFilters
        empty={filteredCatalog.length === 0}
        catalogError={catalogError}
        loading={loading}
      >
        <div>
          {Object.entries(groupBy(filteredCatalog, 'group')).map(
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
