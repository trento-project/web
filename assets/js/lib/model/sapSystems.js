export const DATABASE_TYPE = 'database';
export const APPLICATION_TYPE = 'application';

export const ENSA1 = 'ensa1';
export const ENSA2 = 'ensa2';
export const NO_ENSA = 'no_ensa';

export const ensaVersions = [ENSA1, ENSA2];

export const isValidEnsaVersion = (ensaVersion) =>
  ensaVersions.includes(ensaVersion);

export const getEnsaVersionLabel = (ensaVersion) =>
  ensaVersion === NO_ENSA ? '-' : ensaVersion.toUpperCase();
