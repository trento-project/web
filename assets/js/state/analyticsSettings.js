import { useEffect, useState } from 'react';
import { saveSettings, getSettings } from '@lib/api/analyticsSettings';

export const useAnalyticsSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});
  const [fetchError, setFetchError] = useState(false);
  const [entityErrors, setEntityErrors] = useState([]);

  const fetchAnalyticsSettings = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const { data } = await getSettings();
      setSettings(data);
    } catch ({ response: { status } }) {
      // Handle the error
      setSettings({});
      if (status !== 404) setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const saveAnalyticsSettings = async (newSettings) => {
    setLoading(true);
    setEntityErrors([]);
    try {
      // Save the new settings
      const { data } = await saveSettings(newSettings);
      setSettings(data);
    } catch ({
      response: {
        data: { errors },
      },
    }) {
      // Handle the error
      setEntityErrors(errors || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsSettings();
  }, []);

  return {
    saveAnalyticsSettings,
    fetchAnalyticsSettings,
    analyticsSettingsLoading: loading,
    analyticsSettingsFetchError: fetchError,
    analyticsSettingsEntityErrors: entityErrors,
    analyticsSettings: settings,
  };
};
