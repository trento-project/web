import { networkClient } from '@lib/network';

export const getSettings = () => networkClient.get(`/settings/suse_manager`);

export const saveSettings = (settings) =>
  networkClient.post(`/settings/suse_manager`, settings);

export const updateSettings = (settings) =>
  networkClient.patch(`/settings/suse_manager`, settings);

export const clearSettings = () =>
  networkClient.delete(`/settings/suse_manager`);

export const testConnection = () =>
  networkClient.post(`/settings/suse_manager/test`);
