import { useState, useEffect } from 'react';
import { logError } from '@lib/log';
import { useDispatch } from 'react-redux';
import { dismissNotification } from '@state/notifications';
import { API_KEY_EXPIRATION_NOTIFICATION_ID } from '@state/sagas/settings';
import { get, patch } from '@lib/network';

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
