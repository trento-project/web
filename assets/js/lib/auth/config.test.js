import { isSingleSignOnEnabled } from './config';

describe('auth config', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should check if single sign on is enabled', () => {
    expect(isSingleSignOnEnabled()).toBeFalsy();

    global.config.oidcEnabled = true;
    
    return import('./config').then(config => {
      expect(config.isSingleSignOnEnabled()).toBeTruthy();
    });
  });

  it('should get OIDC login url if OIDC is enabled', async () => {
    global.config.oidcEnabled = true;
    
    return import('./config').then(config => {
      expect(config.getSingleSignOnLoginUrl()).toBe(
        'http://localhost:4000/auth/oidc_callback'
      );
    });
  });
});
