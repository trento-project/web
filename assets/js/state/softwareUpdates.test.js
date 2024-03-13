import softwareUpdatesReducer, {
  startLoadingSoftwareUpdates,
  setSoftwareUpdates,
  setEmptySoftwareUpdates,
  setSoftwareUpdatesErrors,
} from './softwareUpdates';

describe('SoftwareUpdates reducer', () => {
  it('should mark retrieval of software updates in loading state', () => {
    const initialState = {
      loading: false,
    };

    const action = startLoadingSoftwareUpdates();

    const expectedState = {
      loading: true,
    };

    expect(softwareUpdatesReducer(initialState, action)).toEqual(expectedState);
  });

  it('should set software updates', () => {
    const initialState = {
      loading: true,
      softwareUpdates: [
        { hostId: 'host1', softwareUpdates: [] },
        {
          hostId: 'host2',
          softwareUpdates: [
            {
              date: '2024-03-11',
              advisory_name: 'SUSE-15-SP4-2024-833',
              advisory_type: 'Security Advisory',
              advisory_status: 'stable',
              id: 4244,
              advisory_synopsis: 'moderate: Security update for openssl-1_1',
              update_date: '2024-03-11',
            },
            {
              from_epoch: ' ',
              to_release: '150100.8.33.1',
              name: 'saptune',
              from_release: '150400.3.208.1',
              to_epoch: ' ',
              arch: 'x86_64',
              to_package_id: 39942,
              from_version: '3.1.0',
              to_version: '3.1.2',
              from_arch: 'x86_64',
              to_arch: 'x86_64',
            },
          ],
        },
      ],
      errors: [],
    };

    const newSoftwareUpdates = [
      {
        from_epoch: ' ',
        to_release: '150300.3.30.1',
        name: 'openssh-server',
        from_release: '150300.3.15.4',
        to_epoch: ' ',
        arch: 'x86_64',
        to_package_id: 39543,
        from_version: '8.4p1',
        to_version: '8.4p1',
        from_arch: 'x86_64',
        to_arch: 'x86_64',
      },
      {
        date: '2023-05-30',
        advisory_name: 'SUSE-15-SP4-2023-2317',
        advisory_type: 'Bug Fix Advisory',
        advisory_status: 'stable',
        id: 2226,
        advisory_synopsis: 'Recommended update for util-linux',
        update_date: '2023-05-30',
      },
    ];

    const action = setSoftwareUpdates({
      hostId: 'host2',
      softwareUpdates: newSoftwareUpdates,
    });

    const actual = softwareUpdatesReducer(initialState, action);

    expect(actual).toEqual({
      loading: false,
      softwareUpdates: [
        { hostId: 'host1', softwareUpdates: [] },
        { hostId: 'host2', softwareUpdates: newSoftwareUpdates },
      ],
      errors: [],
    });
  });

  it('should empty software updates', () => {
    const initialState = {
      loading: true,
      softwareUpdates: [
        { hostId: 'host1', softwareUpdates: [] },
        { hostId: 'host2', softwareUpdates: [] },
      ],
      errors: [],
    };

    const action = setEmptySoftwareUpdates();

    const actual = softwareUpdatesReducer(initialState, action);

    expect(actual).toEqual({
      loading: false,
      softwareUpdates: [],
      errors: [],
    });
  });

  it('should set errors upon if error occurred', () => {
    const initialState = {
      loading: true,
      softwareUpdates: [
        {
          hostId: 'host1',
          softwareUpdates: [
            {
              date: '2024-03-11',
              advisory_name: 'SUSE-15-SP4-2024-833',
              advisory_type: 'Security Advisory',
              advisory_status: 'stable',
              id: 4244,
              advisory_synopsis: 'moderate: Security update for openssl-1_1',
              update_date: '2024-03-11',
            },
            {
              from_epoch: ' ',
              to_release: '150100.8.33.1',
              name: 'saptune',
              from_release: '150400.3.208.1',
              to_epoch: ' ',
              arch: 'x86_64',
              to_package_id: 39942,
              from_version: '3.1.0',
              to_version: '3.1.2',
              from_arch: 'x86_64',
              to_arch: 'x86_64',
            },
          ],
        },
      ],
      errors: [],
    };

    const errors = [
      {
        detail: 'some error occurred while retrieving software updates',
        title: 'An error occurred',
      },
      {
        detail: 'another error has also occurred',
        title: 'Another error occured',
      },
    ];

    const action = setSoftwareUpdatesErrors(errors);

    const actual = softwareUpdatesReducer(initialState, action);

    expect(actual).toEqual({ ...initialState, loading: false, errors });
  });
});
