import React, { useEffect, useState } from 'react';
import { without, uniq, groupBy, noop } from 'lodash';

import { toggle } from '@lib/lists';

import CheckCustomizationModal from '@common/CheckCustomizationModal';
import ResetCheckCustomizationModal from '@common/ResetCheckCustomizationModal';
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
  groupID,
  catalog,
  selectedChecks = defaultSelectedChecks,
  loading = false,
  catalogError,
  userAbilities = defaultAbilities,
  onUpdateCatalog,
  onChange,
  provider,
  saveCustomCheck = () => {},
  onResetCheckCustomization = noop,
}) {
  const [isCheckCustomizationModalOpen, setIsCheckCustomizationModalOpen] =
    useState(false);
  const [isResetConfirmationModalOpen, setResetConfirmationModalOpen] =
    useState(false);
  const [selectedCheck, setSelectedCheck] = useState(null);

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
        <ResetCheckCustomizationModal
          key={selectedCheck?.id}
          checkId={selectedCheck?.id}
          open={!!isResetConfirmationModalOpen}
          onReset={() => {
            onResetCheckCustomization(groupID, selectedCheck?.id);
            setResetConfirmationModalOpen(false);
          }}
          onCancel={() => {
            setResetConfirmationModalOpen(false);
            setSelectedCheck(null);
          }}
        />
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
                customized={check.customized}
                onChange={() => {
                  onChange(toggle(check.id, selectedChecks));
                }}
                onCustomize={() => {
                  setSelectedCheck(check);
                  setIsCheckCustomizationModalOpen(true);
                }}
                onResetCustomization={() => {
                  setSelectedCheck(check);
                  setResetConfirmationModalOpen(true);
                }}
              />
            ))}
          </ChecksSelectionGroup>
        ))}
        <CheckCustomizationModal
          open={isCheckCustomizationModalOpen}
          id={selectedCheck?.id}
          values={selectedCheck?.values}
          description={selectedCheck?.description}
          customized={selectedCheck?.customized}
          selectedCheck={selectedCheck}
          provider={provider}
          onClose={() => {
            setIsCheckCustomizationModalOpen(false);
            setSelectedCheck(null);
          }}
          onSave={saveCustomCheck}
        />
      </div>
    </CatalogContainer>
  );
}

export default ChecksSelection;
