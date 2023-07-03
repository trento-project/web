import hostsReducer, {
  removeHost,
  setHostDeregisterable,
  setHostNotDeregisterable,
} from '@state/hosts';
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

  it('should mark host as deregisterable', () => {
    const [host1, host2] = hostFactory.buildList(2);
    const initialState = {
      hosts: [host1, host2],
    };

    const action = setHostDeregisterable(host1);

    const expectedState = {
      hosts: [{ ...host1, isDeregisterable: true }, host2],
    };

    expect(hostsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should mark host as not deregisterable', () => {
    const [host1, host2] = hostFactory.buildList(2);
    const initialState = {
      hosts: [{ ...host1, isDeregisterable: true }, host2],
    };

    const action = setHostNotDeregisterable(host1);

    const expectedState = {
      hosts: [{ ...host1, isDeregisterable: false }, host2],
    };

    expect(hostsReducer(initialState, action)).toEqual(expectedState);
  });
});
