import { isSingleSignOnEnabled } from './config';

describe('auth config', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should check if single sign on is enabled', () => {
    expect(isSingleSignOnEnabled()).toBeFalsy();

    global.config.ssoEnabled = true;

    return import('./config').then((config) => {
      expect(config.isSingleSignOnEnabled()).toBeTruthy();
    });
  });

  it('should get SSO login url if SSO is enabled', async () => {
    global.config.ssoEnabled = true;

    return import('./config').then((config) => {
      expect(config.getSingleSignOnLoginUrl()).toBe(
        'http://localhost:4000/auth/oidc_callback'
      );
    });
  });

  it('should get SSO callback url if SSO is enabled', async () => {
    global.config.ssoEnabled = true;

    return import('./config').then((config) => {
      expect(config.getSingleSignOnCallbackUrl()).toBe('/auth/oidc_callback');
    });
  });
});
