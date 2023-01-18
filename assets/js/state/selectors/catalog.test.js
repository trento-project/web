import { getCatalog } from './catalog';

describe('Catalog selector', () => {
  it('should return the correct catalog state', () => {
    const state = {
      catalog: {
        loading: false,
        data: [1, 2, 3],
        error: null,
      },
    };

    const expectedState = {
      loading: false,
      data: [1, 2, 3],
      error: null,
    };

    expect(getCatalog()(state)).toEqual(expectedState);
  });
});
