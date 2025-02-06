import { useState } from 'react';
import { getChecksSelection } from '@lib/api/checks';

export const useChecksSelection = () => {
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

  return {
    checksSelectionLoading: loading,
    checksSelectionFetchError: fetchError,
    checksSelection,
    fetchChecksSelection,
  };
};
