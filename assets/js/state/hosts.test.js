import { faker } from '@faker-js/faker';
import hostsReducer, {
  removeHost,
  setHostListDeregisterable,
  setHostNotDeregisterable,
  setHostDeregistering,
  setHostNotDeregistering,
  updateSelectedChecks,
} from '@state/hosts';
import { hostFactory } from '@lib/test-utils/factories';

describe('Hosts reducer', () => {
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

    const action = setHostNotDeregistering(host1);

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
      targetID: host1.id,
      checks: newChecksSelection,
    });

    const expectedState = {
      hosts: [{ ...host1, selected_checks: newChecksSelection }, host2],
    };

    expect(hostsReducer(initialState, action)).toEqual(expectedState);
  });
});
