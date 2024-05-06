import { adminUser, userFactory } from '@lib/test-utils/factories/users';

import { isAdmin } from './users';

describe('users', () => {
  it('should check if a user is admin', () => {
    const admin = adminUser.build();
    expect(isAdmin(admin)).toBe(true);

    const user = userFactory.build({ id: 2 });
    expect(isAdmin(user)).toBe(false);
  });
});
