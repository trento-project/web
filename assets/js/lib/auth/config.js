import { getFromConfig } from '@lib/config';

const OIDC_ENABLED = getFromConfig('oidcEnabled') || false;
const OIDC_LOGIN_URL = getFromConfig('oidcLoginUrl') || '';
const OIDC_CALLBACK_URL = getFromConfig('oidcCallbackUrl') || '';

export const isSingleSignOnEnabled = () => OIDC_ENABLED;

export const getSingleSignOnLoginUrl = () => {
  if (OIDC_ENABLED) {
    return OIDC_LOGIN_URL;
  }

  return '';
};

export const getSingleSignOnCallbackUrl = () => {
  if (OIDC_ENABLED) {
    return OIDC_CALLBACK_URL;
  }

  return '';
};
