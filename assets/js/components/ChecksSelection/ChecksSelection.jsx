import React, { useEffect } from 'react';
import { without, uniq, groupBy } from 'lodash';

import { toggle } from '@lib/lists';

import CatalogContainer from '@components/ChecksCatalog/CatalogContainer';
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

function ChecksSelection({
  catalog,
  selectedChecks = defaultSelectedChecks,
  loading = false,
  catalogError,
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
      isCatalogEmpty={catalog.length === 0}
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
                premium={check.premium}
                selected={check.selected}
                onChange={() => {
                  onChange(toggle(check.id, selectedChecks));
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
