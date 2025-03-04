import { useEffect, useState } from 'react';
import { saveSettings, getSettings } from '@lib/api/analyticsSettings';

export const useAnalyticsSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});

  const fetchAnalyticsSettings = async () => {
    setLoading(true);
    try {
      const { data } = await getSettings();
      setSettings(data);
    } catch (error) {
      // Handle the error
    } finally {
      setLoading(false);
    }
  };

  const saveAnalyticsSettings = async (newSettings) => {
    setLoading(true);
    try {
      // Save the new settings
      const { data } = await saveSettings(newSettings);
      setSettings(data);
    } catch (error) {
      // Handle the error
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
    analyticsSettings: settings,
  };
};
