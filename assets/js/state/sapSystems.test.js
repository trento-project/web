import sapSystemsReducer, { removeSAPSystem } from '@state/sapSystems';
import { sapSystemFactory } from '@lib/test-utils/factories/sapSystems';

describe('SAP Systems reducer', () => {
  it('should remove SAP system from state', () => {
    const [sapSystem1, sapSystem2] = sapSystemFactory.buildList(2);
    const initialState = {
      sapSystems: [sapSystem1, sapSystem2],
    };

    const action = removeSAPSystem(sapSystem1);

    const expectedState = {
      sapSystems: [sapSystem2],
    };

    expect(sapSystemsReducer(initialState, action)).toEqual(expectedState);
  });
});
