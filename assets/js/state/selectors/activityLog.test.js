import { getALUsers } from './activityLog';

describe('Activity Log users selector', () => {
  it('should return a list of users from activity log state', () => {
    const users = ['user1', 'user2', 'user3'];
    const state = {
      activityLog: { users },
    };

    expect(getALUsers(state)).toEqual(users);
  });
});
