import { getFromConfig } from '@lib/config';

const TRENTO_ADMIN_USERNAME = getFromConfig('adminUsername') || 'admin';

export const isAdmin = (user) => user.username === TRENTO_ADMIN_USERNAME;

export const isPermitted = (userAbilities, permittedFor) =>
  userAbilities
    .map(({ name, resource }) => `${name}:${resource}`)
    .some((ability) => permittedFor.includes(ability));
