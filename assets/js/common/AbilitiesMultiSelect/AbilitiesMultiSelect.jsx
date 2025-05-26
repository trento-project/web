import React from 'react';
import { assign, find } from 'lodash';
import { getFromConfig } from '@lib/config';

import MultiSelect from '@common/MultiSelect';

const groupedAbilities = [
  {
    ability: 'all:checks_selection',
    tooltip: 'Permits all operations on checks selection',
    groupAbilities: [
      'all:host_checks_selection',
      'all:cluster_checks_selection',
    ],
  },
  {
    ability: 'all:checks_execution',
    tooltip: 'Permits all operations on checks execution',
    groupAbilities: [
      'all:host_checks_execution',
      'all:cluster_checks_execution',
    ],
  },
  {
    ability: 'cleanup:all',
    tooltip: 'Permits cleanup of resources',
    groupAbilities: [
      'cleanup:host',
      'cleanup:database_instance',
      'cleanup:application_instance',
    ],
  },
  {
    ability: 'all:tags',
    tooltip: 'Permits all operations on tags',
    groupAbilities: [
      'all:host_tags',
      'all:cluster_tags',
      'all:database_tags',
      'all:sap_system_tags',
    ],
  },
  {
    ability: 'all:settings',
    tooltip: 'Permits all operations on settings',
    groupAbilities: [
      'all:api_key_settings',
      'all:suma_settings',
      'all:activity_logs_settings',
    ],
  },
  {
    ability: 'operation:all',
    tooltip: 'Permits running operations in all resources',
    groupAbilities: [
      'saptune_solution_apply:host',
      'saptune_solution_change:host',
      'maintenance_change:cluster',
    ],
  },
];

const mapAbilities = (abilities, operationsEnabled) =>
  abilities.reduce((acc, { id, name, resource, label }) => {
    const valueLabel = `${name}:${resource}`;
    const groupedAbility = find(groupedAbilities, ({ groupAbilities }) =>
      groupAbilities.includes(valueLabel)
    );

    if (!groupedAbility) {
      return acc.concat({ value: id, label: valueLabel, tooltip: label });
    }

    // remove operations abilities by now
    if (!operationsEnabled && groupedAbility.ability === 'operation:all') {
      return acc;
    }

    const currentOption = find(acc, { label: groupedAbility.ability });
    if (currentOption) {
      assign(currentOption, { value: currentOption.value.concat(id) });
      return acc;
    }

    return acc.concat({
      value: [id],
      label: groupedAbility.ability,
      tooltip: groupedAbility.tooltip,
    });
  }, []);

const unmapAbilities = (abilities) =>
  abilities.map(({ value }) => value).flat();

function AbilitiesMultiSelect({
  abilities,
  userAbilities,
  placeholder,
  setAbilities,
  operationsEnabled = getFromConfig('operationsEnabled'),
  ...props
}) {
  return (
    <MultiSelect
      aria-label="permissions"
      placeholder={placeholder}
      values={mapAbilities(userAbilities, operationsEnabled)}
      options={mapAbilities(abilities, operationsEnabled)}
      onChange={(values) => setAbilities(unmapAbilities(values))}
      getOptionValue={(option) => option.value.toString()}
      {...props}
    />
  );
}

export default AbilitiesMultiSelect;
