import {
  adminUser,
  userFactory,
  abilityFactory,
} from '@lib/test-utils/factories/users';

import { isPermitted, isAdmin } from './users';

describe('users', () => {
  it('should check if a user is admin', () => {
    const admin = adminUser.build({ username: 'admin' });
    expect(isAdmin(admin)).toBe(true);

    const user = userFactory.build({ username: 'other' });
    expect(isAdmin(user)).toBe(false);
  });

  it.each`
    permittedFor              | expectedIsPermitted
    ${[]}                     | ${false}
    ${['foo:bar']}            | ${true}
    ${['baz:qux', 'bar:baz']} | ${true}
    ${['baz:qux']}            | ${false}
    ${['qux:ber']}            | ${false}
  `(
    'should check if a user has permissions',
    ({ permittedFor, expectedIsPermitted }) => {
      const abilities = [
        abilityFactory.build({ name: 'foo', resource: 'bar' }),
        abilityFactory.build({ name: 'bar', resource: 'baz' }),
      ];

      expect(isPermitted(abilities, permittedFor)).toBe(expectedIsPermitted);
      expect(isPermitted([], permittedFor)).toBe(false);
    }
  );
});
