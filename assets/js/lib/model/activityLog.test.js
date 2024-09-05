import { abilityFactory } from '@lib/test-utils/factories/users';
import { difference } from 'lodash';
import {
  ACTIVITY_TYPES,
  allowedActivities,
  LOGIN_ATTEMPT,
  PROFILE_UPDATE,
  USER_CREATION,
  USER_DELETION,
  USER_MODIFICATION,
} from './activityLog';

const nonUserManagementActivities = difference(ACTIVITY_TYPES, [
  LOGIN_ATTEMPT,
  USER_CREATION,
  USER_MODIFICATION,
  USER_DELETION,
  PROFILE_UPDATE,
]);

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

      hasUserMgmtActivities
        ? expect(relevantActivities).toEqual(ACTIVITY_TYPES)
        : expect(relevantActivities).toEqual(nonUserManagementActivities);
    }
  );
});
