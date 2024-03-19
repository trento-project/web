import { networkClient } from '@lib/network';

export const getSoftwareUpdates = (hostId) =>
  networkClient.get(`/hosts/${hostId}/software_updates`);
