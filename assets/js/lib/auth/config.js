import { getFromConfig } from '@lib/config';

const OIDC_ENABLED = getFromConfig('oidcEnabled') || false;
const OIDC_LOGIN_URL = getFromConfig('oidcLoginUrl') || '';

export const isSingleSignOnEnabled = () => OIDC_ENABLED;

export const getSingleSignOnLoginUrl = () => {
  if (OIDC_ENABLED) {
    return OIDC_LOGIN_URL;
  }

  return '';
};
