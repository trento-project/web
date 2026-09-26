// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react';
import classNames from 'classnames';
import { get, groupBy, mapValues, trim } from 'lodash';

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
import Accordion from '@common/Accordion';
import PageHeader from '@common/PageHeader';
import Select, { createOptionRenderer, OPTION_ALL } from '@common/Select';
import ProviderLabel from '@common/ProviderLabel';
import TargetIcon from '@common/TargetIcon';

import { changeSearchParams } from '@lib/searchParams';

import usePersistentSearchParams from '@hooks/usePersistentSearchParams';

import CatalogContainer from './CatalogContainer';
import CheckItem from './CheckItem';

const TARGET_TYPE_PARAM = 'targetType';
const CLUSTER_TYPE_PARAM = 'clusterType';
const HANA_SCENARIO_PARAM = 'hanaScenario';
const PROVIDER_PARAM = 'provider';
const ARCHITECTURE_PARAM = 'architecture';

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
  ({ type, hanaScenario }) =>
    trim(
      `${getClusterTypeLabel(type)} ${getClusterScenarioLabel(hanaScenario)}`
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
    </TargetIcon>
  )
);

function ChecksCatalog({ catalog, catalogError, loading, updateCatalog }) {
  const [searchParams, setSearchParams] =
    usePersistentSearchParams('checksCatalog');
  // Store serialized version to check for changes in the useEffect
  const currentSearchParams = searchParams.toString();

  const selectedProvider = searchParams.get(PROVIDER_PARAM) || OPTION_ALL;
  const selectedTargetType = searchParams.get(TARGET_TYPE_PARAM) || OPTION_ALL;
  const selectedArchitecture =
    searchParams.get(ARCHITECTURE_PARAM) || OPTION_ALL;

  const currentClusterType = searchParams.get(CLUSTER_TYPE_PARAM);
  const selectedClusterType = currentClusterType
    ? {
        type: currentClusterType,
        hanaScenario: searchParams.get(HANA_SCENARIO_PARAM),
      }
    : OPTION_ALL;

  // A filter set to OPTION_ALL is stored as an absent search param, so that a
  // catalog without any filter has a bare query string
  const changeFilters = (newFilters) =>
    setSearchParams(
      changeSearchParams(
        mapValues(newFilters, (value) => (value === OPTION_ALL ? null : value))
      )
    );

  const filters = [
    {
      'aria-label': 'targets',
      options: targetTypes.map((targetType) => ({
        label: targetType,
        value: targetType,
      })),
      renderOption: targetTypeOptionRenderer,
      value: selectedTargetType,
      onChange: (targetType) =>
        changeFilters({
          [TARGET_TYPE_PARAM]: targetType,
          ...(targetType !== TARGET_CLUSTER && {
            [CLUSTER_TYPE_PARAM]: OPTION_ALL,
            [HANA_SCENARIO_PARAM]: OPTION_ALL,
          }),
          ...(targetType !== TARGET_HOST && {
            [ARCHITECTURE_PARAM]: OPTION_ALL,
          }),
        }),
    },
    {
      'aria-label': 'cluster-types',
      options: clusterCatalogFilters.map(({ type, hanaScenario }) => ({
        label: { type, hanaScenario },
        value: { type, hanaScenario },
      })),
      renderOption: clusterTypeRenderer,
      value: selectedClusterType,
      getOptionValue: ({ value }) =>
        value === OPTION_ALL
          ? OPTION_ALL
          : `${value.type}_${value.hanaScenario}`,
      onChange: (clusterType) =>
        changeFilters({
          [CLUSTER_TYPE_PARAM]: get(clusterType, 'type', OPTION_ALL),
          [HANA_SCENARIO_PARAM]: get(clusterType, 'hanaScenario', OPTION_ALL),
        }),
      isDisabled: selectedTargetType !== TARGET_CLUSTER,
    },
    {
      'aria-label': 'providers',
      options: providers,
      renderOption: providerOptionRenderer,
      value: selectedProvider,
      onChange: (provider) => changeFilters({ [PROVIDER_PARAM]: provider }),
    },
    {
      'aria-label': 'architectures',
      options: architectures,
      renderOption: architectureOptionRenderer,
      value: selectedArchitecture,
      onChange: (architecture) =>
        changeFilters({ [ARCHITECTURE_PARAM]: architecture }),
      isDisabled: selectedTargetType !== TARGET_HOST,
    },
  ];

  const selectedFilters = {
    selectedProvider,
    selectedArchitecture,
    selectedTargetType,
    selectedClusterType: get(selectedClusterType, 'type', OPTION_ALL),
    selectedHanaScenario: get(selectedClusterType, 'hanaScenario', OPTION_ALL),
  };

  useEffect(() => {
    updateCatalog(selectedFilters);
  }, [currentSearchParams]);

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
        onClear={() => setSearchParams({})}
        onRefresh={() => updateCatalog(selectedFilters)}
        withResetFilters
        empty={catalog.length === 0}
        catalogError={catalogError}
        loading={loading}
      >
        <div>
          {Object.entries(groupBy(catalog, 'group')).map(
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
