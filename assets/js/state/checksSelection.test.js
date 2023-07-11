import checksSelectionReducer, {
  startSavingChecksSelection,
  stopSavingChecksSelection,
  setChecksSelectionSavingSuccess,
} from '@state/checksSelection';

describe('Checks Selection reducer', () => {
  it('should mark a check selection as saving', () => {
    const initialState = {
      saving: false,
      savingSuccess: false,
    };

    const action = startSavingChecksSelection();

    const expectedState = {
      saving: true,
      savingSuccess: false,
    };

    expect(checksSelectionReducer(initialState, action)).toEqual(expectedState);
  });

  it('should mark a check selection as completed', () => {
    const initialState = {
      saving: true,
      savingSuccess: false,
    };

    const action = stopSavingChecksSelection();

    const expectedState = {
      saving: false,
      savingSuccess: false,
    };

    expect(checksSelectionReducer(initialState, action)).toEqual(expectedState);
  });

  it('should mark a successfully saved check selection', () => {
    const initialState = {
      saving: true,
      savingSuccess: false,
    };

    const action = setChecksSelectionSavingSuccess();

    const expectedState = {
      saving: true,
      savingSuccess: true,
    };

    expect(checksSelectionReducer(initialState, action)).toEqual(expectedState);
  });
});
