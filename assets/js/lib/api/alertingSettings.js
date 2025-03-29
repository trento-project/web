import { networkClient } from '@lib/network';

const alerting_uri = "/settings/alerting"

export const getSettings = () => networkClient.get(alerting_uri);

export const saveSettings = (settings) =>
  networkClient.post(alerting_uri, settings);

export const updateSettings = (settings) =>
  networkClient.patch(alerting_uri, settings);
