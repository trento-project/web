import { networkClient } from '@lib/network';

export const getActivityLog = () => networkClient.get(`/activity_log`);
