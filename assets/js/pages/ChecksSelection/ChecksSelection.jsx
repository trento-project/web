import React, { useEffect } from 'react';
import { without, uniq, groupBy } from 'lodash';

import { toggle } from '@lib/lists';

import CatalogContainer from '@pages/ChecksCatalog/CatalogContainer';
import ChecksSelectionGroup, {
  NONE_CHECKED,
  SOME_CHECKED,
  ALL_CHECKED,
  allSelected,
} from './ChecksSelectionGroup';
import ChecksSelectionItem from './ChecksSelectionItem';

const isSelected = (selectedChecks, checkID) =>
  selectedChecks ? selectedChecks.includes(checkID) : false;

const getGroupSelectedState = (checks, selectedChecks) => {
  if (checks.every(({ id }) => isSelected(selectedChecks, id))) {
    return ALL_CHECKED;
  }
  if (checks.some((check) => isSelected(selectedChecks, check.id))) {
    return SOME_CHECKED;
  }
  return NONE_CHECKED;
};

const defaultSelectedChecks = [];
const defaultAbilities = [];

function ChecksSelection({
  catalog,
  selectedChecks = defaultSelectedChecks,
  loading = false,
  catalogError,
  userAbilities = defaultAbilities,
  onUpdateCatalog,
  onChange,
}) {
  const groupedChecks = Object.entries(groupBy(catalog, 'group')).map(
    ([group, checks]) => {
      const groupChecks = checks.map((check) => ({
        ...check,
        selected: isSelected(selectedChecks, check.id),
      }));

      return {
        group,
        checks: groupChecks,
        groupSelected: getGroupSelectedState(checks, selectedChecks),
      };
    }
  );

  useEffect(() => {
    onUpdateCatalog();
  }, []);

  const onCheckSelectionGroupChange = (checks, groupSelected) => {
    const groupChecks = checks.map((check) => check.id);
    if (allSelected(groupSelected)) {
      onChange(without(selectedChecks, ...groupChecks));
    } else {
      onChange(uniq([...selectedChecks, ...groupChecks]));
    }
  };

  return (
    <CatalogContainer
      onRefresh={onUpdateCatalog}
      empty={catalog.length === 0}
      catalogError={catalogError}
      loading={loading}
    >
      <div className="pb-4">
        {groupedChecks?.map(({ group, checks, groupSelected }) => (
          <ChecksSelectionGroup
            key={group}
            group={group}
            selected={groupSelected}
            onChange={() => onCheckSelectionGroupChange(checks, groupSelected)}
          >
            {checks.map((check) => (
              <ChecksSelectionItem
                key={check.id}
                checkID={check.id}
                name={check.name}
                description={check.description}
                selected={check.selected}
                userAbilities={userAbilities}
                customizable={check.customizable}
                onChange={() => {
                  onChange(toggle(check.id, selectedChecks));
                }}
                onCustomize={() => {
                  alert('Coming Soon!');
                }}
              />
            ))}
          </ChecksSelectionGroup>
        ))}
      </div>
    </CatalogContainer>
  );
}

export default ChecksSelection;
