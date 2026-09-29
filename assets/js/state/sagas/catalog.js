// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { put, call, takeEvery } from 'redux-saga/effects';
import { getCatalog } from '@lib/api/checks';

import {
  UPDATE_CATALOG,
  setCatalogLoading,
  setCatalogData,
  setCatalogError,
} from '@state/catalog';

export function* updateCatalog({ payload }) {
  yield put(setCatalogLoading());
  try {
    const {
      data: { items },
    } = yield call(getCatalog, payload);
    yield put(setCatalogData({ data: items }));
  } catch (error) {
    yield put(setCatalogError({ error: error.message }));
  }
}

export function* watchCatalogEvents() {
  yield takeEvery(UPDATE_CATALOG, updateCatalog);
}
