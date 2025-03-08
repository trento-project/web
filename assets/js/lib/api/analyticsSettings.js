import { networkClient } from '@lib/network';

export const getSettings = async () => networkClient.get(`/settings/analytics`);

export const saveSettings = async (settings) =>
  networkClient.post(`/settings/analytics`, settings);
