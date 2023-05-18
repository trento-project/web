import hostsReducer, { removeHost } from '@state/hosts';

describe('Hosts reducer', () => {
  it('should remove host from state', () => {
    const id = 'test-host-id';
    const initialState = {
      hosts: [{ id }],
    };

    const action = removeHost({ id });

    const expectedState = {
      hosts: [],
    };

    expect(hostsReducer(initialState, action)).toEqual(expectedState);
  });
});
