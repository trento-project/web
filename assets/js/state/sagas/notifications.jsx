/* eslint-disable require-yield */
import React from 'react';
import { takeEvery } from 'redux-saga/effects';
import { toast } from 'react-hot-toast';
import {
  NOTIFICATION,
  DISMISSABLE_NOTIFICATION,
  DISMISS_NOTIFICATION,
  CUSTOM_NOTIFICATION,
} from '@state/notifications';
import DismissableToast from '@common/DismissableToast';
import { getNotification } from '@common/ToastNotifications';
import HealthIcon from '@common/HealthIcon';

const DEFAULT_DURATION = 4000;

const getIcon = (icon, isHealthIcon) =>
  isHealthIcon ? <HealthIcon health={icon} /> : icon;

export function* notification({ payload }) {
  const { id, text, icon, duration, isHealthIcon } = payload;
  const toastIcon = getIcon(icon, isHealthIcon);
  toast(<p className="text-sm font-medium text-gray-900">{text}</p>, {
    position: 'top-right',
    icon: toastIcon,
    id,
    duration: duration || DEFAULT_DURATION,
  });
}

export function* dismissableNotification({ payload }) {
  const { id, text, icon, duration, isHealthIcon } = payload;
  const toastIcon = getIcon(icon, isHealthIcon);
  toast((t) => <DismissableToast text={text} toastID={t.id} />, {
    position: 'top-right',
    icon: toastIcon,
    id,
    duration: duration || DEFAULT_DURATION,
  });
}

export function* customNotification({ payload }) {
  const { id, icon, duration, isHealthIcon } = payload;
  const toastIcon = getIcon(icon, isHealthIcon);
  const component = getNotification(payload);
  toast(component, {
    position: 'top-right',
    icon: toastIcon,
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
  yield takeEvery(CUSTOM_NOTIFICATION, customNotification);
  yield takeEvery(DISMISS_NOTIFICATION, dismissNotification);
}
