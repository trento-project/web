import hostsReducer, {
  removeHost,
  setHostsDeregisterable,
  setHostNotDeregisterable,
} from '@state/hosts';
import { hostFactory } from '@lib/test-utils/factories';

describe('Hosts reducer', () => {
  it('should correctly mark hosts as deregisterable', () => {
    const host1 = hostFactory.build();
    const host2 = hostFactory.build();
    const host3 = hostFactory.build();
    const initialState = { hosts: [host1, host2, host3] };

    const action = setHostsDeregisterable([host2, host3]);

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
});
