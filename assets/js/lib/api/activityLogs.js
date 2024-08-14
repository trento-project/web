import { networkClient } from '@lib/network';

export const getActivityLog = (params) =>
  networkClient.get(`/activity_log`, { params });
