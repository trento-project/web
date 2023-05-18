import sapSystemsReducer, { removeSAPSystem } from '@state/sapSystems';
import { sapSystemFactory } from '@lib/test-utils/factories/sapSystems';

describe('SAP Systems reducer', () => {
  it('should remove SAP system from state', () => {
    const sapSystem = sapSystemFactory.build();
    const initialState = {
      sapSystems: [sapSystem],
    };

    const action = removeSAPSystem(sapSystem);

    const expectedState = {
      sapSystems: [],
    };

    expect(sapSystemsReducer(initialState, action)).toEqual(expectedState);
  });
});
