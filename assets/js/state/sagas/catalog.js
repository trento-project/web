import { put, call, takeEvery } from 'redux-saga/effects';
import { getCatalog } from '@lib/api/checks';

import {
  UPDATE_CATALOG,
  setCatalogLoading,
  setFilteredCatalog,
  setCatalogData,
  setCatalogError,
} from '@state/catalog';
import { get, pickBy } from 'lodash';

const requiresFilteredCatalog = (payload) =>
  get(payload, 'filteredCatalog', false);

const plainPayload = (payload) =>
  pickBy(payload, (_, key) => key !== 'filteredCatalog');

export function* updateCatalog({ payload }) {
  yield put(setCatalogLoading());
  try {
    const {
      data: { items },
    } = yield call(getCatalog, plainPayload(payload));
    yield put(
      requiresFilteredCatalog(payload)
        ? setFilteredCatalog({ data: items })
        : setCatalogData({ data: items })
    );
  } catch (error) {
    yield put(setCatalogError({ error: error.message }));
  }
}

export function* watchCatalogEvents() {
  yield takeEvery(UPDATE_CATALOG, updateCatalog);
}
