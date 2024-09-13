import { recordSaga } from '@lib/test-utils';
import { userFactory } from '@lib/test-utils/factories/users';
import { setUsers } from '@state/activityLog';
import { activityLogUsersUpdate } from './activityLog';

describe('Activity Logs saga', () => {
  it('should set users when activity log users are updated', async () => {
    const users = userFactory.buildList(5).map((user) => user.username);

    const dispatched = await recordSaga(activityLogUsersUpdate, {
      payload: { users },
    });

    expect(dispatched).toEqual([setUsers({ users })]);
  });
});
