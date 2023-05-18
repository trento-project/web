import hostsReducer, { removeHost } from '@state/hosts';
import { hostFactory } from '@lib/test-utils/factories';

describe('Hosts reducer', () => {
  it('should remove host from state', () => {
    const host = hostFactory.build();
    const initialState = {
      hosts: [host],
    };

    const action = removeHost(host);

    const expectedState = {
      hosts: [],
    };

    expect(hostsReducer(initialState, action)).toEqual(expectedState);
  });
});
