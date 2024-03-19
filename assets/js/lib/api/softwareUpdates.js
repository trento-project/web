import { networkClient } from '@lib/network';

export const getSoftwareUpdates = (hostID) =>
  networkClient.get(`/hosts/${hostID}/software_updates`);
