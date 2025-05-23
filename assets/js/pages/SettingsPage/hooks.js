import { useState, useEffect } from 'react';
import { isEmpty, omitBy, isNil } from 'lodash';
import { useDispatch } from 'react-redux';

import { dismissNotification, notify } from '@state/notifications';
import { API_KEY_EXPIRATION_NOTIFICATION_ID } from '@state/sagas/settings';

import { logError } from '@lib/log';
import { get, patch } from '@lib/network';
import {
  getSettings,
  saveSettings,
  updateSettings,
  clearSettings,
  testConnection,
} from '@lib/api/suseManagerSettings';
import {
  getSettings as getAlertingSettings,
  saveSettings as saveAlertingSettings,
  updateSettings as updateAlertingSettings,
} from '@lib/api/alertingSettings';

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
    clearSuseManagerEntityErrors: () => setEntityErrors([]),
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

export const useAlertingSettings = () => {
  const [settings, setSettings] = useState({});
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [submitErrors, setSubmitErrors] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  function fromApiSettings(data) {
    return {
      alertingEnabled: data.enabled,
      smtpServer: data.smtp_server,
      smtpPort: data.smtp_port,
      smtpUsername: data.smtp_username,
      senderEmail: data.sender_email,
      recipientEmail: data.recipient_email,
      enforcedFromEnv: data.enforced_from_env,
    };
  }

  function toApiSettings(newSettings) {
    const data = {
      enabled: newSettings.alertingEnabled,
      smtp_server: newSettings.smtpServer,
      smtp_port: newSettings.smtpPort,
      smtp_username: newSettings.smtpUsername,
      smtp_password: newSettings.smtpPassword,
      sender_email: newSettings.senderEmail,
      recipient_email: newSettings.recipientEmail,
    };

    return omitBy(data, isNil);
  }

  function clearSubmitErrors() {
    setSubmitErrors([]);
  }

  async function fetch() {
    setFetchLoading(true);
    setFetchError(false);

    try {
      const { data } = await getAlertingSettings();
      setSettings(fromApiSettings(data));
    } catch ({ response: { status } }) {
      setSettings({});
      if (status !== 404) setFetchError(true);
    } finally {
      setFetchLoading(false);
    }
  }

  async function submit(newSettings) {
    setSubmitLoading(true);
    clearSubmitErrors([]);
    const action = isEmpty(settings)
      ? saveAlertingSettings
      : updateAlertingSettings;

    try {
      const { data } = await action(toApiSettings(newSettings));
      setSettings(fromApiSettings(data));
    } catch ({
      response: {
        data: { errors },
      },
    }) {
      setSubmitErrors(errors);
    } finally {
      setSubmitLoading(false);
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  return {
    settings,
    fetchLoading,
    fetchError,
    submitLoading,
    submitErrors,
    fetch,
    submit,
    clearSubmitErrors,
  };
};
