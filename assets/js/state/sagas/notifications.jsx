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

export function* notification({ payload }) {
  const { text, icon, id, duration } = payload;
  toast(<p className="text-sm font-medium text-gray-900">{text}</p>, {
    position: 'top-right',
    icon,
    id,
    duration: duration || 4000,
  });
}

export function* dismissableNotification({ payload }) {
  const { text, icon, id, duration } = payload;
  toast((t) => <DismissableToast text={text} toastInstance={t} />, {
    position: 'top-right',
    icon,
    id,
    duration: duration || 4000,
  });
}

export function* dismissNotification({ payload }) {
  const { notificationID } = payload;
  toast.dismiss(notificationID);
}

export function* watchNotifications() {
  yield takeEvery(NOTIFICATION, notification);
  yield takeEvery(DISMISSABLE_NOTIFICATION, dismissableNotification);
  yield takeEvery(DISMISS_NOTIFICATION, dismissNotification);
}
