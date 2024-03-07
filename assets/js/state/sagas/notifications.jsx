/* eslint-disable require-yield */
import React from 'react';
import { takeEvery } from 'redux-saga/effects';
import { toast } from 'react-hot-toast';
import {
  NOTIFICATION,
  DISMISSABLE_NOTIFICATION,
  DISMISS_NOTIFICATION,
} from '@state/notifications';
import DismissableToast from '@common/DismissableToast';

const DEFAULT_DURATION = 4000;

export function* notification({ payload }) {
  const { id, text, icon, duration } = payload;
  toast(<p className="text-sm font-medium text-gray-900">{text}</p>, {
    position: 'top-right',
    icon,
    id,
    duration: duration || DEFAULT_DURATION,
  });
}

export function* dismissableNotification({ payload }) {
  const { id, text, icon, duration } = payload;
  toast((t) => <DismissableToast text={text} toastID={t.id} />, {
    position: 'top-right',
    icon,
    id,
    duration: duration || DEFAULT_DURATION,
  });
}

export function* dismissNotification({ payload }) {
  const { id } = payload;
  toast.dismiss(id);
}

export function* watchNotifications() {
  yield takeEvery(NOTIFICATION, notification);
  yield takeEvery(DISMISSABLE_NOTIFICATION, dismissableNotification);
  yield takeEvery(DISMISS_NOTIFICATION, dismissNotification);
}
