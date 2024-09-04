import { getFromConfig } from '@lib/config';

const SSO_ENABLED = getFromConfig('ssoEnabled') || false;
const SSO_LOGIN_URL = getFromConfig('ssoLoginUrl') || '';
const SSO_CALLBACK_URL = getFromConfig('ssoCallbackUrl') || '';

export const isSingleSignOnEnabled = () => SSO_ENABLED;

export const getSingleSignOnLoginUrl = () => {
  if (SSO_ENABLED) {
    return SSO_LOGIN_URL;
  }

  return '';
};

export const getSingleSignOnCallbackUrl = () => {
  if (SSO_ENABLED) {
    return SSO_CALLBACK_URL;
  }

  return '';
};
