import catalogReducer, {
  setCatalogLoading,
  setCatalogData,
  setCatalogError,
} from './catalog';

describe('Catalog reducer', () => {
  it('should set catalog on loading state', () => {
    const initialState = {
      loading: false,
    };

    const action = setCatalogLoading();

    const expectedState = {
      loading: true,
    };

    expect(catalogReducer(initialState, action)).toEqual(expectedState);
  });

  it('should set catalog data', () => {
    const initialState = {
      loading: true,
      data: [],
    };

    const action = setCatalogData({ data: [1, 2, 3] });

    const expectedState = {
      loading: false,
      data: [1, 2, 3],
      error: null,
    };

    const actual = catalogReducer(initialState, action);

    expect(actual).toEqual(expectedState);
  });

  it('should set catalog error', () => {
    const initialState = {
      loading: true,
      data: [],
      error: null,
    };

    const error = 'some-error';

    const action = setCatalogError({ data: [], error });

    const expectedState = {
      loading: false,
      data: [],
      error,
    };

    const actual = catalogReducer(initialState, action);

    expect(actual).toEqual(expectedState);
  });
});
