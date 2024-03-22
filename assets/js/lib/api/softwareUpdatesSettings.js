import { networkClient } from '@lib/network';

export const getSettings = () =>
  networkClient.get(`/settings/suma_credentials`);

export const saveSettings = (settings) =>
  networkClient.post(`/settings/suma_credentials`, settings);

export const updateSettings = (settings) =>
  networkClient.patch(`/settings/suma_credentials`, settings);

export const clearSettings = () =>
  networkClient.delete(`/settings/suma_credentials`);

export const testConnection = () =>
  networkClient.post(`/settings/suma_credentials/test`);
