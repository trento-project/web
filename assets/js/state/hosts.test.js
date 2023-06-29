import hostsReducer, { removeHost } from '@state/hosts';
import { hostFactory } from '@lib/test-utils/factories';

describe('Hosts reducer', () => {
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
