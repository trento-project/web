import semver from 'semver';

export const agentVersionWarning = (agentVersion) => {
  if (semver.lt(agentVersion, '2.0.0')) {
    return 'Agent version 2.0.0 or greater is required for the new checks engine.';
  }

  return null;
};
