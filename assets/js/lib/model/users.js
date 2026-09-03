// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { getFromConfig } from '@lib/config';

let TRENTO_ADMIN_USERNAME;

const getAdminUsername = () => {
  if (TRENTO_ADMIN_USERNAME === undefined) {
    TRENTO_ADMIN_USERNAME = getFromConfig('adminUsername') || 'admin';
  }
  return TRENTO_ADMIN_USERNAME;
};

export const isAdmin = (user) => user.username === getAdminUsername();

export const isPermitted = (userAbilities, permittedFor) =>
  userAbilities
    .map(({ name, resource }) => `${name}:${resource}`)
    .some((ability) => permittedFor.includes(ability));
