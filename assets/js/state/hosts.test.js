import hostsReducer, { removeHost } from '@state/hosts';

describe('Hosts reducer', () => {
  it('should remove host from state', () => {
    const host = { id: 'test-host-id' };
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
