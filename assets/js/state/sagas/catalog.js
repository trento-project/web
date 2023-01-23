import { put, call, takeEvery } from 'redux-saga/effects';
import { getCatalog } from '@lib/api/checks';
import { UPDATE_CATALOG } from '@state/actions/catalog';

import {
  setCatalogLoading,
  setCatalogData,
  setCatalogError,
} from '@state/catalogNew';

export function* updateCatalog({ payload }) {
  yield put(setCatalogLoading());
  try {
    const { data } = yield call(getCatalog, payload);
    yield put(setCatalogData({ data: data.items }));
  } catch (error) {
    yield put(setCatalogError({ error: error.message }));
  }
}

export function* watchCatalogUpdateNew() {
  yield takeEvery(UPDATE_CATALOG, updateCatalog);
}
