import { difference } from 'lodash';
import { abilityFactory } from '@lib/test-utils/factories/users';
import {
  ACTIVITY_TYPES,
  allowedActivities,
  LOGIN_ATTEMPT,
  PROFILE_UPDATE,
  USER_CREATION,
  USER_DELETION,
  USER_MODIFICATION,
  availableResourceNameKeys,
  resourceNameFromMetadata,
  resourceTypes,
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
    userAbilities                         | hasUserMgmtActivities
    ${[]}                                 | ${false}
    ${[['all', 'all']]}                   | ${true}
    ${[['all', 'users']]}                 | ${true}
    ${[['all', 'all'], ['all', 'users']]} | ${true}
    ${[['all', 'all'], ['foo', 'bar']]}   | ${true}
    ${[['all', 'users'], ['bar', 'baz']]} | ${true}
    ${[['baz', 'qux'], ['bar', 'baz']]}   | ${false}
    ${[['baz', 'qux']]}                   | ${false}
    ${[['qux', 'ber']]}                   | ${false}
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

  describe('resource name detection', () => {
    it('should expose available resource name keys', () => {
      expect(availableResourceNameKeys).toStrictEqual([
        'hostname',
        'name',
        'sid',
      ]);
    });

    it.each`
      resourceType        | metadata                                    | expectedResourceName
      ${'host'}           | ${{ foo: 'bar', hostname: 'an_hostname' }}  | ${'an_hostname'}
      ${'cluster'}        | ${{ foo: 'bar', name: 'a_clustername' }}    | ${'a_clustername'}
      ${'database'}       | ${{ foo: 'bar', sid: 'a_database_sid' }}    | ${'a_database_sid'}
      ${'sap_system'}     | ${{ foo: 'bar', sid: 'an_sap_system_sid' }} | ${'an_sap_system_sid'}
      ${'not_a_resource'} | ${{ foo: 'bar', sid: 'sid' }}               | ${'unrecognized resource'}
    `(
      'should extract correct resource name from metadata, when possible',
      ({ resourceType, metadata, expectedResourceName }) => {
        expect(resourceNameFromMetadata(resourceType, metadata)).toBe(
          expectedResourceName
        );
      }
    );

    it.each(resourceTypes)(
      'should gracefully handle missing resource names',
      (resourceType) => {
        expect(resourceNameFromMetadata(resourceType, { foo: 'bar' })).toBe(
          'unrecognized resource'
        );
      }
    );
  });
});
