import { isSingleSignOnEnabled } from './config';

describe('auth config', () => {
  it('should check if single sign on is enabled', () => {
    expect(isSingleSignOnEnabled()).toBe(false);
  });
});
