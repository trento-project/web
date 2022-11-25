import { put, call, takeEvery } from 'redux-saga/effects';

import { get } from '@lib/network';

import {
  setCatalogLoading,
  setCatalogData,
  setCatalogError,
} from '@state/catalogNew';

const wandaURL = process.env.WANDA_URL;

export function* updateCatalog() {
  yield put(setCatalogLoading());
  try {
    const { data: data } = yield call(get, `${wandaURL}/api/checks/catalog`);
    yield put(setCatalogData({ data: data.items }));
  } catch (error) {
    yield put(setCatalogError({ error: error.message }));
  }
}

export function* watchCatalogUpdateNew() {
  yield takeEvery('UPDATE_CATALOG_NEW', updateCatalog);
}
