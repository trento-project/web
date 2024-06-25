import { get } from '@lib/network';
import { differenceInDays, parseISO, isAfter } from 'date-fns';
import { call, put } from 'redux-saga/effects';
import { notify, dismissableNotify } from '@state/notifications';

export const API_KEY_EXPIRATION_NOTIFICATION_ID = 'api-key-expiration-toast';

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

  if (isAfter(new Date(), expireTS)) {
    yield put(
      notify({
        text: 'API Key has expired. Go to Settings to issue a new key',
        icon: 'critical',
        duration: Infinity,
        id: API_KEY_EXPIRATION_NOTIFICATION_ID,
        isHealthIcon: true,
      })
    );
    return;
  }

  const notificationText =
    expirationDays === 0
      ? 'API Key expires today'
      : `API Key expires in ${expirationDays} days`;

  yield put(
    dismissableNotify({
      text: notificationText,
      icon: 'warning',
      duration: Infinity,
      id: API_KEY_EXPIRATION_NOTIFICATION_ID,
      isHealthIcon: true,
    })
  );
}
