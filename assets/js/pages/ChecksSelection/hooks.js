import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { pipe, map, omit } from 'lodash/fp';

import { notify } from '@state/notifications';

import { getChecksSelection, resetCheckCustomization } from '@lib/api/checks';

const markCheckAsNotCustomized = (check) => ({
  ...check,
  customized: false,
});

const resetValuesCustomizations = (check) => ({
  ...check,
  values: map(omit('custom_value'))(check.values),
});

const resetCheck = (checkId) => (check) =>
  check.id === checkId
    ? pipe(markCheckAsNotCustomized, resetValuesCustomizations)(check)
    : check;

export const useChecksSelection = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [checksSelection, setChecksSelection] = useState([]);
  const [fetchError, setFetchError] = useState(null);

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

  const resetChecksCustomization = async (groupId, checkId) => {
    try {
      await resetCheckCustomization(groupId, checkId);
      pipe(
        map(resetCheck(checkId)),
        setChecksSelection,
        () => ({ text: `Customization was reset!`, icon: '✅' }),
        notify,
        dispatch
      )(checksSelection);
    } catch (error) {
      pipe(
        () => ({ text: `Unable to reset customization`, icon: '❌' }),
        notify,
        dispatch
      )();
    }
  };

  return {
    checksSelectionLoading: loading,
    checksSelectionFetchError: fetchError,
    checksSelection,
    fetchChecksSelection,
    resetChecksCustomization,
  };
};
