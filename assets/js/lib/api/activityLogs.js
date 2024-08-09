import { networkClient } from '@lib/network';

export const getActivityLog = (filters = {}) =>
  networkClient.get(`/activity_log`, {
    params: filters,
  });
