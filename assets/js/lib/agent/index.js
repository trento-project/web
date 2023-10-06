import semver from 'semver';

export const agentVersionWarning = (agentVersion) => {
  if (semver.lt(agentVersion, '2.0.0')) {
    return 'The Agent version is outdated, some features might not work properly. It is advised to keep the Agents up to date with the Server.';
  }

  return null;
};
