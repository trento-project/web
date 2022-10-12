export const description = (catalog, checkId) => {
  return catalog.find(({ id }) => id === checkId)?.description;
};

export const sortChecks = (checksResults = []) => {
  return checksResults.sort((a, b) => {
    return a.check_id > b.check_id ? 1 : -1;
  });
};

export const sortHosts = (hosts = []) => {
  return hosts.sort((a, b) => {
    return a.host_id > b.host_id ? 1 : -1;
  });
};

export const getHostname =
  (hosts = []) =>
  (hostId) => {
    return hosts.reduce((acc, host) => {
      if (host.id === hostId) {
        return host.hostname;
      }

      return acc;
    }, '');
  };

export const findCheck = (catalog, checkID) => {
  return catalog.find((check) => check.id === checkID);
};
