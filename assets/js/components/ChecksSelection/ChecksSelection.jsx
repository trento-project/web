import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

import { remove, uniq, toggle, groupBy } from '@lib/lists';

import { EOS_LOADING_ANIMATED } from 'eos-icons-react';

import CatalogContainer from '@components/ChecksCatalog/CatalogContainer';
import ChecksSelectionGroup, {
  NONE_CHECKED,
  SOME_CHECKED,
  ALL_CHECKED,
  allSelected,
} from './ChecksSelectionGroup';
import ChecksSelectionItem from './ChecksSelectionItem';
import FailAlert from './FailAlert';
import ExecutionSuggestion from './ExecutionSuggestion';

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
  className,
  targetID,
  catalog,
  selected = defaultSelectedChecks,
  loading = false,
  saving = false,
  error,
  success = false,
  catalogError,
  hosts,
  onUpdateCatalog,
  onStartExecution,
  onSave,
  onClear,
}) {
  const [selectedChecks, setSelectedChecks] = useState(selected);

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
    onClear();
  }, []);

  const onCheckSelectionGroupChange = (checks, groupSelected) => {
    const groupChecks = checks.map((check) => check.id);
    if (allSelected(groupSelected)) {
      setSelectedChecks(remove(groupChecks, selectedChecks));
    } else {
      setSelectedChecks(uniq([...selectedChecks, ...groupChecks]));
    }
    onClear();
  };

  return (
    <div className={classNames('bg-white rounded p-3', className)}>
      <CatalogContainer
        onRefresh={onUpdateCatalog}
        isCatalogEmpty={catalog.length === 0}
        catalogError={catalogError}
        loading={loading}
      >
        <div>
          <div className="pb-4">
            {groupedChecks?.map(({ group, checks, groupSelected }) => (
              <ChecksSelectionGroup
                key={group}
                group={group}
                selected={groupSelected}
                onChange={() =>
                  onCheckSelectionGroupChange(checks, groupSelected)
                }
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
                      setSelectedChecks(toggle(check.id, selectedChecks));
                      onClear();
                    }}
                  />
                ))}
              </ChecksSelectionGroup>
            ))}
          </div>
          <div className="place-items-end flex">
            <button
              className="flex justify-center items-center bg-jungle-green-500 hover:opacity-75 text-white font-bold py-2 px-4 rounded"
              disabled={saving}
              onClick={() => onSave(selectedChecks, targetID)}
              type="button"
              data-testid="save-selection-button"
            >
              {saving ? (
                <span className="px-20">
                  <EOS_LOADING_ANIMATED color="green" size={25} />
                </span>
              ) : (
                'Save Check Selection'
              )}
            </button>
            {error && (
              <FailAlert onClose={onClear}>
                <p>{error}</p>
              </FailAlert>
            )}
            {success && selectedChecks.length > 0 && (
              <ExecutionSuggestion
                targetID={targetID}
                selectedChecks={selectedChecks}
                hosts={hosts}
                onClose={onClear}
                onStartExecution={onStartExecution}
              />
            )}
          </div>
        </div>
      </CatalogContainer>
    </div>
  );
}

export default ChecksSelection;
