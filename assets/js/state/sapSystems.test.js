import sapSystemsReducer, { removeSAPSystem } from '@state/sapSystems';

describe('SAP Systems reducer', () => {
  it('should remove SAP system from state', () => {
    const sapSystem = { id: 'test-sap-system-id' };
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
