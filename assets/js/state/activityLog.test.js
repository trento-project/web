import { userFactory } from '@lib/test-utils/factories/users';

import activityLogReducer, { setUsers, initialState } from './activityLog';

describe('activityLog reducer', () => {
  it('should set the users for activity log when setUsers is dispatched', () => {
    const { username: username1 } = userFactory.build();
    const { username: username2 } = userFactory.build();
    const users = [username1, username2];
    const action = setUsers({ users });
    expect(activityLogReducer(initialState, action)).toEqual({
      users,
    });
  });
  it('should set the users for activity log when setUsers is dispatched with non empty initial state', () => {
    const { username: username1 } = userFactory.build();
    const { username: username2 } = userFactory.build();
    const { username: username3 } = userFactory.build();
    const users = [username1, username2];
    const nonEmptyInitialState = {users: [username3]};
    const action = setUsers({ users });
    expect(activityLogReducer(nonEmptyInitialState, action)).toEqual({
      users
    });
  });
});
