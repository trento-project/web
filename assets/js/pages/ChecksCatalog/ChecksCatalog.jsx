import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { get, groupBy, trim } from 'lodash';

import {
  architectures,
  providers,
  targetTypes,
  TARGET_HOST,
  TARGET_CLUSTER,
} from '@lib/model';
import {
  clusterCatalogFilters,
  getClusterTypeLabel,
  getClusterScenarioLabel,
} from '@lib/model/clusters';
import {
  hasChecksForClusterType,
  hasChecksForTarget,
  hasChecksForHanaScenario,
} from '@lib/model/checks';
import Accordion from '@common/Accordion';
import PageHeader from '@common/PageHeader';
import Select, { createOptionRenderer, OPTION_ALL } from '@common/Select';
import ProviderLabel from '@common/ProviderLabel';
import TargetIcon from '@common/TargetIcon';
import CatalogContainer from './CatalogContainer';
import CheckItem from './CheckItem';

const providerOptionRenderer = createOptionRenderer(
  'All providers',
  (provider) => <ProviderLabel provider={provider} />
);

const architectureOptionRenderer = createOptionRenderer(
  'All architectures',
  (arch) => <span>{arch}</span>
);

const clusterTypeRenderer = createOptionRenderer(
  'All cluster types',
  ({ type, hanaScenario }) => {
    trim(
      `${getClusterTypeLabel(type)} ${getClusterScenarioLabel(hanaScenario)}`
    );
  }
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
  const [selectedArchitecture, setSelectedArchitecture] = useState(OPTION_ALL);

  const onTargetTypeChange = (targetType) => {
    if (targetType !== TARGET_CLUSTER) {
      setSelectedClusterType(OPTION_ALL);
    }
    setSelectedTargetType(targetType);
  };

  const filters = [
    {
      'aria-label': 'targets',
      options: targetTypes.map((targetType) => ({
        label: targetType,
        value: targetType,
        isDisabled: !hasChecksForTarget(completeCatalog, targetType),
      })),
      renderOption: targetTypeOptionRenderer,
      initialValues: [selectedTargetType],
      onChange: onTargetTypeChange,
    },
    {
      'aria-label': 'cluster-types',
      options: clusterCatalogFilters.map(({ type, hanaScenario }) => ({
        label: { type, hanaScenario },
        value: { type, hanaScenario },
        key: `${type}_${hanaScenario}`,
        isDisabled:
          !hasChecksForClusterType(completeCatalog, type) ||
          !hasChecksForHanaScenario(completeCatalog, hanaScenario),
      })),
      renderOption: clusterTypeRenderer,
      initialValues: [selectedClusterType],
      onChange: setSelectedClusterType,
      isDisabled: selectedTargetType !== TARGET_CLUSTER,
    },
    {
      'aria-label': 'providers',
      options: providers,
      renderOption: providerOptionRenderer,
      initialValues: [selectedProvider],
      onChange: setProviderSelected,
    },
    {
      'aria-label': 'architectures',
      options: architectures,
      renderOption: architectureOptionRenderer,
      initialValues: [selectedArchitecture],
      onChange: setSelectedArchitecture,
      isDisabled: selectedTargetType !== TARGET_HOST,
    },
  ];

  useEffect(() => {
    updateCatalog({
      selectedProvider,
      selectedArchitecture,
      selectedTargetType,
      selectedClusterType: get(selectedClusterType, 'type', OPTION_ALL),
      selectedHanaScenario: get(
        selectedClusterType,
        'hanaScenario',
        OPTION_ALL
      ),
    });
  }, [
    selectedArchitecture,
    selectedProvider,
    selectedTargetType,
    selectedClusterType,
  ]);

  const clearFilters = () => {
    setProviderSelected(OPTION_ALL);
    setSelectedTargetType(OPTION_ALL);
    setSelectedClusterType(OPTION_ALL);
    setSelectedArchitecture(OPTION_ALL);
  };

  return (
    <>
      <div className="flex items-center space-x-4">
        <PageHeader className="font-bold flex-1 w-64 pb-4">
          Checks catalog
        </PageHeader>
        {filters.map((filterProps) => (
          <Select
            key={filterProps['aria-label']}
            className="ml-auto pb-4 min-w-48 max-w-fit"
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
