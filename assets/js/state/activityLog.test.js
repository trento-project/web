import { userFactory } from '@lib/test-utils/factories/users';

import activityLogReducer, {
  setUsers,
  initialState,
  // alUsersPushed,
} from './activityLog';

describe('activityLog reducer', () => {
  it('should set the users for activity log when setUsers is dispatched', () => {
    const {username: username1} = userFactory.build();
    const {username: username2} = userFactory.build();
    const users = [username1, username2];
    const action = setUsers({users});
    expect(activityLogReducer(initialState, action)).toEqual({
      users
    });
  });
});
