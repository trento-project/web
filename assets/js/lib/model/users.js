import { getFromConfig } from '@lib/config';

const TRENTO_ADMIN_USERNAME = getFromConfig('adminUsername') || 'admin';
const OIDC_ENABLED = getFromConfig('oidcEnabled') || false;

export const isAdmin = (user) => user.username === TRENTO_ADMIN_USERNAME;
export const isSingleSignOnEnabled = () => OIDC_ENABLED;
