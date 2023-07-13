import hostChecksSelectionReducer, {
  startSavingChecksSelection,
  stopSavingChecksSelection,
} from '@state/hostChecksSelection';

describe('Checks Selection reducer', () => {
  it('should mark a check selection as saving', () => {
    const initialState = {
      saving: false,
    };

    const action = startSavingChecksSelection();

    const expectedState = {
      saving: true,
    };

    expect(hostChecksSelectionReducer(initialState, action)).toEqual(
      expectedState
    );
  });

  it('should mark a check selection as completed', () => {
    const initialState = {
      saving: true,
    };

    const action = stopSavingChecksSelection();

    const expectedState = {
      saving: false,
    };

    expect(hostChecksSelectionReducer(initialState, action)).toEqual(
      expectedState
    );
  });
});
