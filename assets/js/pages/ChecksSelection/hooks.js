import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { pipe, map, omit } from 'lodash/fp';

import { notify } from '@state/notifications';

import {
  getChecksSelection,
  resetCheckCustomization,
  saveCheckCustomization,
} from '@lib/api/checks';

const setCheckCustomized = (customized) => (check) => ({
  ...check,
  customized,
});

const applyValueCustomization = ({ value, customization }) =>
  customization ? { ...value, custom_value: customization.value } : value;

const findValueCustomization = (customValues) => (value) => ({
  value,
  customization: customValues.find(({ name }) => name === value.name),
});

const saveValuesCustomizations = (customValues) => (check) => ({
  ...check,
  values: map(
    pipe(findValueCustomization(customValues), applyValueCustomization)
  )(check.values),
});

const resetValuesCustomizations = (check) => ({
  ...check,
  values: map(omit('custom_value'))(check.values),
});

const saveCheck = (checkID, customValues) => (check) =>
  check.id === checkID
    ? pipe(
        setCheckCustomized(true),
        saveValuesCustomizations(customValues)
      )(check)
    : check;

const resetCheck = (checkId) => (check) =>
  check.id === checkId
    ? pipe(setCheckCustomized(false), resetValuesCustomizations)(check)
    : check;

export const READY = 'ready';
export const ONGOING = 'ongoing';
export const INVALID_VALUES = 'invalid_values';
export const GENERIC_FAILURE = 'generic_failure';

export const CUSTOMIZATION_STATUSES = [
  READY,
  ONGOING,
  INVALID_VALUES,
  GENERIC_FAILURE,
];

export const isReady = (status) => status === READY;
export const isOngoing = (status) => status === ONGOING;
export const isFailed = (status) =>
  [GENERIC_FAILURE, INVALID_VALUES].includes(status);
export const isInvalidValues = (status) => status === INVALID_VALUES;
export const isGenericFailure = (status) => status === GENERIC_FAILURE;

export const useChecksSelection = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [checksSelection, setChecksSelection] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [customizationStatus, setCustomizationStatus] = useState(READY);

  const notifySuccess = (successMsg) =>
    pipe(() => ({ text: successMsg, icon: '✅' }), notify, dispatch);

  const notifyError = (errorMsg) =>
    pipe(() => ({ text: errorMsg, icon: '❌' }), notify, dispatch)();

  const fetchChecksSelection = async (groupId, env) => {
    setLoading(true);
    setFetchError(null);
    try {
      const {
        data: { items },
      } = await getChecksSelection(groupId, env);
      setChecksSelection(items);
    } catch (error) {
      setFetchError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveChecksCustomization = async (checkID, groupID, customValues) => {
    setCustomizationStatus(ONGOING);
    try {
      const {
        data: { values },
      } = await saveCheckCustomization(checkID, groupID, customValues);
      pipe(
        map(saveCheck(checkID, values)),
        setChecksSelection,
        notifySuccess('Check was customized successfully')
      )(checksSelection);
      setCustomizationStatus(READY);
    } catch ({ response: { status } }) {
      notifyError('Failed to customize check');
      setCustomizationStatus(status === 400 ? INVALID_VALUES : GENERIC_FAILURE);
    }
  };

  const resetChecksCustomization = async (groupId, checkId) => {
    try {
      await resetCheckCustomization(groupId, checkId);
      pipe(
        map(resetCheck(checkId)),
        setChecksSelection,
        notifySuccess('Customization was reset!')
      )(checksSelection);
    } catch (error) {
      notifyError('Unable to reset customization');
    }
  };

  return {
    checksSelectionLoading: loading,
    checksSelectionFetchError: fetchError,
    checksSelection,
    fetchChecksSelection,
    resetChecksCustomization,
    saveChecksCustomization,
    customizationStatus,
  };
};
