// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import semver from 'semver';

export const SUPPORTED_VERSION = '3.1.0';

export const isVersionSupported = (saptuneVersion) =>
  semver.gte(saptuneVersion || '0.0.0', SUPPORTED_VERSION);
