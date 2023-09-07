import semver from 'semver';

export const SUPPORTED_VERSION = '3.1.0';

export const isVersionSupported = (saptuneVersion) =>
  semver.gte(saptuneVersion || '0.0.0', SUPPORTED_VERSION);
