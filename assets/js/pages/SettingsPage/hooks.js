import { useState, useEffect } from 'react';
import { logError } from '@lib/log';
import { useDispatch } from 'react-redux';
import { dismissNotification } from '@state/notifications';
import { notify } from '@state/notifications';
import { API_KEY_EXPIRATION_NOTIFICATION_ID } from '@state/sagas/settings';
import { get, patch } from '@lib/network';
import {
  getSettings,
  saveSettings,
  updateSettings,
  clearSettings,
  testConnection,
} from '@lib/api/suseManagerSettings';

export const useSuseManagerSettings = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({});
  const [entityErrors, setEntityErrors] = useState([]);
  const [fetchError, setFetchError] = useState(false);
  const [testingSettings, setTestingSettings] = useState(false);

  const fetchSuseManagerSettings = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const { data } = await getSettings();
      setSettings(data);
    } catch ({ response: { status } }) {
      setSettings({});
      if (status !== 404) setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const saveSuseManagerSettings = async (newSettings) => {
    setLoading(true);
    setEntityErrors([]);
    try {
      const { data } = await saveSettings(newSettings);
      setSettings(data);
    } catch ({
      response: {
        data: { errors },
      },
    }) {
      setEntityErrors(errors || []);
    } finally {
      setLoading(false);
    }
  };

  const updateSuseManagerSettings = async (newSettings) => {
    setLoading(true);
    setEntityErrors([]);
    try {
      const { data } = await updateSettings(newSettings);
      setSettings(data);
    } catch ({
      response: {
        data: { errors },
      },
    }) {
      setEntityErrors(errors || []);
    } finally {
      setLoading(false);
    }
  };

  const deleteSuseManagerSettings = async () => {
    setLoading(true);
    try {
      await clearSettings();
      setSettings({});
    } catch (error) {
      dispatch(notify({ text: `Unable to clear settings`, icon: '❌' }));
    } finally {
      setLoading(false);
    }
  };

  const testSuseManagerSettings = async () => {
    setLoading(true);
    setTestingSettings(true);
    try {
      await testConnection();
      dispatch(notify({ text: `Connection succeeded!`, icon: '✅' }));
    } catch (error) {
      dispatch(notify({ text: `Connection failed!`, icon: '❌' }));
    } finally {
      setLoading(false);
      setTestingSettings(false);
    }
  };

  useEffect(() => {
    fetchSuseManagerSettings();
  }, []);

  return {
    fetchSuseManagerSettings,
    saveSuseManagerSettings,
    updateSuseManagerSettings,
    testSuseManagerSettings,
    deleteSuseManagerSettings,
    suseManagerSettingsLoading: loading,
    suseManagerSettings: settings,
    suseManagerSettingsEntityErrors: entityErrors,
    suseManagerSettingsfetchError: fetchError,
    suseManagerSettingsTesting: testingSettings,
  };
};

export const useApiKeySettings = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(null);
  const [apiKeyExpiration, setApiKeyExpiration] = useState(null);

  const fetchApiKeySettings = () =>
    get('/settings/api_key')
      .then(
        ({ data: { generated_api_key: newApiKey, expire_at: expireAt } }) => {
          setApiKey(newApiKey);
          setApiKeyExpiration(expireAt);
        }
      )
      .catch((error) => {
        logError(error);
      })
      .finally(() => {
        setLoading(false);
      });

  const saveApiKeySettings = (expiration) => {
    setLoading(true);
    patch('/settings/api_key', { expire_at: expiration })
      .then(
        ({ data: { generated_api_key: newApiKey, expire_at: expireAt } }) => {
          setApiKey(newApiKey);
          setApiKeyExpiration(expireAt);
          dispatch(dismissNotification(API_KEY_EXPIRATION_NOTIFICATION_ID));
        }
      )
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    fetchApiKeySettings();
  }, []);

  return {
    apiKeyLoading: loading,
    apiKey,
    apiKeyExpiration,
    saveApiKeySettings,
    fetchApiKeySettings,
  };
};
