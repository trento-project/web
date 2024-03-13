import { networkClient } from '@lib/network';

export const getSoftwareUpdates = (hostId) =>
  networkClient.get(`/api/v1/hosts/${hostId}/software_updates`);
