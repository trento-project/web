import { networkClient } from '@lib/network';

export const getSoftwareUpdates = (hostID) =>
  networkClient.get(`/hosts/${hostID}/software_updates`);

export const getPatchesForPackages = (packageIDs) =>
  networkClient.get(`/software_updates/packages`, {
    params: { package_ids: packageIDs },
  });

export const getAdvirosyErrata = (advisoryName) =>
  networkClient.get(`/software_updates/errata_details/${advisoryName}`);
