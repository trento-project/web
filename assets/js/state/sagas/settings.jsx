import React from 'react';
import { get } from '@lib/network';
import { differenceInDays, parseISO } from 'date-fns';
import { call, put } from 'redux-saga/effects';
import HealthIcon from '@common/HealthIcon';
import { notify, dismissableNotify } from '@state/notifications';

export function* checkApiKeyExpiration() {
  const {
    data: { expire_at },
  } = yield call(get, '/settings/api_key');

  if (!expire_at) return;

  const expireTS = parseISO(expire_at);
  const expirationDays = differenceInDays(expireTS, new Date());

  if (expirationDays > 30) {
    return;
  }

  if (expirationDays < 0) {
    yield put(
      notify({
        text: 'API Key has expired. Go to Settings to issue a new key',
        icon: <HealthIcon health="critical" />,
        duration: Infinity,
        id: 'api-key-expiration-toast',
      })
    );
  } else {
    yield put(
      dismissableNotify({
        text: `API Key expires in ${expirationDays} days`,
        icon: <HealthIcon health="warning" />,
        duration: Infinity,
        id: 'api-key-expiration-toast',
      })
    );
  }
}
