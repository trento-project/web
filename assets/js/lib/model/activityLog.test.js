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
  taggingResourceType,
  operationResourceType,
  checkCustomizationResourceType,
} from './activityLog';
import { SAPTUNE_SOLUTION_APPLY } from '../operations';

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

  describe('resource type resolution', () => {
    it('should fallback to default resolution when unable to determine resource type', () => {
      [
        {
          metadata: {},
        },
        {
          metadata: null,
        },
        {
          metadata: undefined,
        },
        {},
      ].forEach((entry) => {
        expect(taggingResourceType(entry)).toBe(
          'Unable to determine resource type'
        );
        expect(operationResourceType(entry)).toBe(
          'Unable to determine operation type'
        );
        expect(checkCustomizationResourceType(entry)).toBe(
          'Unable to determine target type'
        );
      });
    });

    it('should resolve tagging resource types', () => {
      const scenarios = [
        {
          entry: {
            metadata: {
              resource_type: 'host',
            },
          },
          expected: 'Host',
        },
        {
          entry: {
            metadata: {
              resource_type: 'cluster',
            },
          },
          expected: 'Cluster',
        },
        {
          entry: {
            metadata: {
              resource_type: 'database',
            },
          },
          expected: 'Database',
        },
        {
          entry: {
            metadata: {
              resource_type: 'sap_system',
            },
          },
          expected: 'SAP System',
        },
      ];

      scenarios.forEach(({ entry, expected }) => {
        expect(taggingResourceType(entry)).toBe(expected);
      });
    });

    it('should resolve operation resource types', () => {
      const scenarios = [
        {
          entry: {
            metadata: {
              operation: SAPTUNE_SOLUTION_APPLY,
            },
          },
          expected: 'Host',
        },
      ];

      scenarios.forEach(({ entry, expected }) => {
        expect(operationResourceType(entry)).toBe(expected);
      });
    });

    it('should resolve checks customization resource types', () => {
      const scenarios = [
        {
          entry: {
            metadata: {
              target_type: 'host',
            },
          },
          expected: 'Host',
        },
        {
          entry: {
            metadata: {
              target_type: 'cluster',
            },
          },
          expected: 'Cluster',
        },
        {
          entry: {
            metadata: {
              target_type: 'database',
            },
          },
          expected: 'Database',
        },
        {
          entry: {
            metadata: {
              target_type: 'sap_system',
            },
          },
          expected: 'SAP System',
        },
      ];

      scenarios.forEach(({ entry, expected }) => {
        expect(checkCustomizationResourceType(entry)).toBe(expected);
      });
    });
  });
});
