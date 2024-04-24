import { faker } from '@faker-js/faker';
import {
  getSoftwareUpdates,
  getSoftwareUpdatesConnectionError,
  getSoftwareUpdatesStats,
} from './softwareUpdates';

describe('Software Updates selector', () => {
  const hostID = faker.string.uuid();
  const softwareUpdates = {
    [hostID]: {
      relevant_patches: [
        {
          date: '2024-03-13',
          advisory_name: 'SUSE-15-SP4-2024-877',
          advisory_type: 'security_advisory',
          advisory_status: 'stable',
          id: 4263,
          advisory_synopsis: 'important: Security update for sudo',
          update_date: '2024-03-13',
        },
        {
          date: '2024-03-13',
          advisory_name: 'SUSE-15-SP4-2024-871',
          advisory_type: 'security_advisory',
          advisory_status: 'stable',
          id: 4261,
          advisory_synopsis: 'important: Security update for vim',
          update_date: '2024-03-13',
        },
        {
          date: '2024-03-13',
          advisory_name: 'SUSE-15-SP4-2024-870',
          advisory_type: 'security_advisory',
          advisory_status: 'stable',
          id: 4260,
          advisory_synopsis: 'moderate: Security update for glibc',
          update_date: '2024-03-13',
        },
        {
          date: '2024-02-28',
          advisory_name: 'SUSE-15-SP4-2024-641',
          advisory_type: 'bugfix',
          advisory_status: 'stable',
          id: 4189,
          advisory_synopsis: 'Recommended update for gcc7',
          update_date: '2024-02-28',
        },
      ],
      upgradable_packages: [
        {
          from_epoch: ' ',
          to_release: '150400.6.10.1',
          name: 'libQt5Network5',
          from_release: '150400.6.3.1',
          to_epoch: ' ',
          arch: 'x86_64',
          to_package_id: 38289,
          from_version: '5.15.2+kde294',
          to_version: '5.15.2+kde294',
          from_arch: 'x86_64',
          to_arch: 'x86_64',
        },
        {
          from_epoch: ' ',
          to_release: '150300.10.51.1',
          name: 'libpython3_6m1_0',
          from_release: '150300.10.40.1',
          to_epoch: ' ',
          arch: 'x86_64',
          to_package_id: 36262,
          from_version: '3.6.15',
          to_version: '3.6.15',
          from_arch: 'x86_64',
          to_arch: 'x86_64',
        },
        {
          from_epoch: ' ',
          to_release: '150400.6.10.1',
          name: 'libQt5Gui5',
          from_release: '150400.6.3.1',
          to_epoch: ' ',
          arch: 'x86_64',
          to_package_id: 38391,
          from_version: '5.15.2+kde294',
          to_version: '5.15.2+kde294',
          from_arch: 'x86_64',
          to_arch: 'x86_64',
        },
      ],
    },
  };
  const state = {
    softwareUpdates: {
      loading: false,
      softwareUpdates,
      errors: [],
    },
  };

  it('should return the software updates', () => {
    expect(getSoftwareUpdates(state)).toEqual({
      loading: false,
      softwareUpdates,
      errors: [],
    });
  });

  it('should return the correct software updates statistics', () => {
    expect(getSoftwareUpdatesStats(state, hostID)).toEqual({
      numRelevantPatches: 4,
      numUpgradablePackages: 3,
    });
  });

  it('should return undefined stats when there is no data for a host', () => {
    const unknownHost = faker.string.uuid();
    expect(getSoftwareUpdatesStats(state, unknownHost)).toEqual({
      numRelevantPatches: undefined,
      numUpgradablePackages: undefined,
    });
  });

  it('should return the connection error', () => {
    const stateWithError = {
      softwareUpdates: {
        connectionError: true,
      },
    };

    const stateWithoutError = {
      softwareUpdates: {
        connectionError: false,
      },
    };

    expect(getSoftwareUpdatesConnectionError(stateWithError)).toEqual(true);
    expect(getSoftwareUpdatesConnectionError(stateWithoutError)).toEqual(false);
    expect(getSoftwareUpdatesConnectionError({ softwareUpdates: {} })).toEqual(
      undefined
    );
  });
});
