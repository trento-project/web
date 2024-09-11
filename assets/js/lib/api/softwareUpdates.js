import { networkClient } from '@lib/network';

export const getSoftwareUpdates = (hostID) =>
  networkClient.get(`/hosts/${hostID}/software_updates`);

export const getPatchesForPackages = (hostID) =>
  networkClient.get(`/software_updates/packages`, {
    params: { host_id: hostID },
  });

export const getAdvisoryErrata = (advisoryName) =>
  networkClient.get(`/software_updates/errata_details/${advisoryName}`);
