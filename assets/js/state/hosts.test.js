import { faker } from '@faker-js/faker';
import hostsReducer, {
  updateHost,
  removeHost,
  setHostListDeregisterable,
  setHostNotDeregisterable,
  setHostDeregistering,
  unsetHostDeregistering,
  updateSelectedChecks,
  updateSaptuneStatus,
} from '@state/hosts';
import { hostFactory, saptuneStatusFactory } from '@lib/test-utils/factories';

describe('Hosts reducer', () => {
  it('should update the host', () => {
    const host1 = hostFactory.build();
    const host2 = hostFactory.build();
    const host3 = hostFactory.build();
    const initialState = { hosts: [host1, host2, host3] };
    const updatedHost = {
      ...host2,
      hostname: 'updated_hostname',
    };

    const action = updateHost(updatedHost);

    const expectedState = {
      hosts: [host1, updatedHost, host3],
    };

    expect(hostsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should correctly mark hosts as deregisterable', () => {
    const host1 = hostFactory.build();
    const host2 = hostFactory.build();
    const host3 = hostFactory.build();
    const initialState = { hosts: [host1, host2, host3] };

    const action = setHostListDeregisterable([host2, host3]);

    const expectedState = {
      hosts: [
        { ...host1, deregisterable: false },
        { ...host2, deregisterable: true },
        { ...host3, deregisterable: true },
      ],
    };

    expect(hostsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should mark host as not deregisterable', () => {
    const host1 = hostFactory.build({ deregisterable: true });
    const host2 = hostFactory.build();
    const initialState = { hosts: [host1, host2] };

    const action = setHostNotDeregisterable(host1);

    const expectedState = {
      hosts: [{ ...host1, deregisterable: false }, host2],
    };

    expect(hostsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should set host in deregistering state', () => {
    const [host1, host2] = hostFactory.buildList(2);
    const initialState = { hosts: [host1, host2] };

    const action = setHostDeregistering(host1);

    const expectedState = {
      hosts: [{ ...host1, deregistering: true }, host2],
    };

    expect(hostsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should remove deregistering state from host', () => {
    const [host1, host2] = hostFactory.buildList(2);
    const initialState = {
      hosts: [host1, host2],
    };

    const action = unsetHostDeregistering(host1);

    const expectedState = {
      hosts: [{ ...host1, deregistering: false }, host2],
    };

    expect(hostsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should remove host from state', () => {
    const [host1, host2] = hostFactory.buildList(2);
    const initialState = {
      hosts: [host1, host2],
    };

    const action = removeHost(host1);

    const expectedState = {
      hosts: [host2],
    };

    expect(hostsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should update the check selection for a host', () => {
    const initialCheckSelection = [
      faker.datatype.uuid(),
      faker.datatype.uuid(),
    ];
    const host1 = hostFactory.build({ selected_checks: initialCheckSelection });
    const host2 = hostFactory.build();
    const initialState = { hosts: [host1, host2] };

    const newChecksSelection = [faker.datatype.uuid(), faker.datatype.uuid()];

    const action = updateSelectedChecks({
      hostID: host1.id,
      checks: newChecksSelection,
    });

    const expectedState = {
      hosts: [{ ...host1, selected_checks: newChecksSelection }, host2],
    };

    expect(hostsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should update saptune status for a host', () => {
    const host1 = hostFactory.build();
    const host2 = hostFactory.build();
    const initialState = { hosts: [host1, host2] };

    const newSaptuneStatus = saptuneStatusFactory.build();

    const action = updateSaptuneStatus({
      id: host1.id,
      status: newSaptuneStatus,
    });

    const expectedState = {
      hosts: [{ ...host1, saptune_status: newSaptuneStatus }, host2],
    };

    expect(hostsReducer(initialState, action)).toEqual(expectedState);
  });
});
