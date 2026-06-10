// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { uniq, flatMap } from 'lodash';

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

export const getSapSystemType = (applicationInstances) =>
  uniq(flatMap(applicationInstances, ({ features }) => features.split('|')))
    .filter((item) => item === 'J2EE' || item === 'ABAP')
    .map((item) => (item === 'J2EE' ? 'JAVA' : item))
    .toSorted()
    .join('+');
