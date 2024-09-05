import { abilityFactory } from '@lib/test-utils/factories/users';
import {
  allowedActivities,
  LOGIN_ATTEMPT,
  PROFILE_UPDATE,
  USER_CREATION,
  USER_DELETION,
  USER_MODIFICATION,
} from './activityLog';

const userManagementActivities = [
  LOGIN_ATTEMPT,
  USER_CREATION,
  USER_MODIFICATION,
  USER_DELETION,
  PROFILE_UPDATE,
];

describe('activityLog', () => {
  it.each`
    userAbilities                        | hasUserMgmtActivities
    ${[]}                                | ${false}
    ${[['all', 'all']]}                  | ${true}
    ${[['all', 'user']]}                 | ${true}
    ${[['all', 'all'], ['all', 'user']]} | ${true}
    ${[['all', 'all'], ['foo', 'bar']]}  | ${true}
    ${[['all', 'user'], ['bar', 'baz']]} | ${true}
    ${[['baz', 'qux'], ['bar', 'baz']]}  | ${false}
    ${[['baz', 'qux']]}                  | ${false}
    ${[['qux', 'ber']]}                  | ${false}
  `(
    'should return relevant activities for the given user abilities',
    ({ userAbilities, hasUserMgmtActivities }) => {
      const abilities = userAbilities.map(([name, resource]) =>
        abilityFactory.build({ name, resource })
      );

      const relevantActivities = allowedActivities(abilities).map(
        ([key, _value]) => key
      );

      const containsAllUserMgmtActivities = userManagementActivities.every(
        (activity) => relevantActivities.includes(activity)
      );

      const doesNotContainAnyUserMgmtActivities =
        userManagementActivities.every(
          (activity) => !relevantActivities.includes(activity)
        );

      hasUserMgmtActivities
        ? expect(containsAllUserMgmtActivities).toBe(true)
        : expect(doesNotContainAnyUserMgmtActivities).toBe(true);
    }
  );
});
