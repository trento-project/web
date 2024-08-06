import { getFromConfig } from '@lib/config';

const OIDC_ENABLED = getFromConfig('oidcEnabled') || false;

export const isSingleSignOnEnabled = () => OIDC_ENABLED;
