import catalogReducer, {
  setCatalogLoading,
  setCatalogData,
  setCatalogError,
  setFilteredCatalog,
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
      filteredCatalog: [],
    };

    [[1, 2, 3], []].forEach((data) => {
      const action = setCatalogData({ data });

      const expectedState = {
        loading: false,
        data,
        filteredCatalog: data,
        error: null,
      };

      const actual = catalogReducer(initialState, action);

      expect(actual).toEqual(expectedState);
    });
  });

  it('should set filtered catalog', () => {
    const initialState = {
      loading: true,
      data: [1, 2, 3, 4, 5],
      filteredCatalog: [1, 2, 3, 4, 5],
    };

    [[1, 2, 3], [2, 5], []].forEach((filteredCatalog) => {
      const action = setFilteredCatalog({ data: filteredCatalog });

      const expectedState = {
        loading: false,
        data: initialState.data,
        filteredCatalog,
        error: null,
      };

      const actual = catalogReducer(initialState, action);

      expect(actual).toEqual(expectedState);
    });
  });

  it('should set catalog error', () => {
    const initialState = {
      loading: true,
      data: [1, 2, 3],
      filteredCatalog: [2, 3],
      error: null,
    };

    const error = 'some-error';

    const action = setCatalogError({ error });

    const expectedState = {
      loading: false,
      data: [],
      filteredCatalog: [],
      error,
    };

    const actual = catalogReducer(initialState, action);

    expect(actual).toEqual(expectedState);
  });
});
