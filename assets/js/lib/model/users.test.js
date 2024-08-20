import { adminUser, userFactory } from '@lib/test-utils/factories/users';

import { isAdmin } from './users';

describe('users', () => {
  it('should check if a user is admin', () => {
    const admin = adminUser.build({ username: 'admin' });
    expect(isAdmin(admin)).toBe(true);

    const user = userFactory.build({ username: 'other' });
    expect(isAdmin(user)).toBe(false);
  });
});
