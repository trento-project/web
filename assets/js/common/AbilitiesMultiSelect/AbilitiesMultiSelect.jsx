import React from 'react';
import { assign, find } from 'lodash';

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
];

const mapAbilities = (abilities) =>
  abilities.reduce((acc, { id, name, resource, label }) => {
    const valueLabel = `${name}:${resource}`;
    const groupedAbility = find(groupedAbilities, ({ groupAbilities }) =>
      groupAbilities.includes(valueLabel)
    );

    if (!groupedAbility) {
      return acc.concat({ value: id, label: valueLabel, tooltip: label });
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
  ...props
}) {
  return (
    <MultiSelect
      aria-label="permissions"
      placeholder={placeholder}
      values={mapAbilities(userAbilities)}
      options={mapAbilities(abilities)}
      onChange={(values) => setAbilities(unmapAbilities(values))}
      getOptionValue={(option) => option.value.toString()}
      {...props}
    />
  );
}

export default AbilitiesMultiSelect;
