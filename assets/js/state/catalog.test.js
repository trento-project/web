// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

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

    [[1, 2, 3], []].forEach((data) => {
      const action = setCatalogData({ data });

      const expectedState = {
        loading: false,
        data,
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
      error: null,
    };

    const error = 'some-error';

    const action = setCatalogError({ error });

    const expectedState = {
      loading: false,
      data: [],
      error,
    };

    const actual = catalogReducer(initialState, action);

    expect(actual).toEqual(expectedState);
  });
});
