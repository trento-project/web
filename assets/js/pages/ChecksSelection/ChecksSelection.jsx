import React, { useEffect, useState } from 'react';
import { without, uniq, groupBy, noop } from 'lodash';
import { pipe } from 'lodash/fp';

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
import { READY } from './hooks';
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

const defaultEmptyArray = [];

function ChecksSelection({
  groupID,
  catalog = defaultEmptyArray,
  selectedChecks = defaultEmptyArray,
  loading = false,
  catalogError,
  userAbilities = defaultEmptyArray,
  onUpdateCatalog = noop,
  onChange,
  provider,
  onSaveCheckCustomization = noop,
  onResetCheckCustomization = noop,
  customizationStatus,
}) {
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [checkBeingCustomized, setCheckBeingCustomized] = useState(null);
  const [savingStatus, setSavingStatus] = useState(customizationStatus);

  const openCustomizationModal = () => setCustomizationModalOpen(true);
  const closeCustomizationModal = () => {
    setCustomizationModalOpen(false);
    setSavingStatus(READY);
  };
  const openResetModal = () => setResetModalOpen(true);
  const closeResetModal = () => setResetModalOpen(false);

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

  useEffect(pipe(closeCustomizationModal, closeResetModal), [catalog]);

  useEffect(() => {
    setSavingStatus(customizationStatus);
  }, [customizationStatus]);

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
                customized={check.customized}
                onChange={() => {
                  onChange(toggle(check.id, selectedChecks));
                }}
                onCustomize={() =>
                  pipe(setCheckBeingCustomized, openCustomizationModal)(check)
                }
                onResetCustomization={() =>
                  pipe(setCheckBeingCustomized, openResetModal)(check)
                }
              />
            ))}
          </ChecksSelectionGroup>
        ))}
        <ResetCheckCustomizationModal
          open={resetModalOpen}
          checkId={checkBeingCustomized?.id}
          onReset={pipe(
            () => onResetCheckCustomization(groupID, checkBeingCustomized?.id),
            closeResetModal,
            closeCustomizationModal
          )}
          onCancel={closeResetModal}
        />
        <CheckCustomizationModal
          open={customizationModalOpen}
          id={checkBeingCustomized?.id}
          groupID={groupID}
          values={checkBeingCustomized?.values}
          description={checkBeingCustomized?.description}
          customized={checkBeingCustomized?.customized}
          provider={provider}
          onSave={onSaveCheckCustomization}
          onReset={openResetModal}
          onClose={closeCustomizationModal}
          customizationStatus={savingStatus}
        />
      </div>
    </CatalogContainer>
  );
}

export default ChecksSelection;
