/* eslint-disable require-yield */
import React from 'react';
import { takeEvery } from 'redux-saga/effects';
import { toast } from 'react-hot-toast';

export function* notification({ payload }) {
  const { text, icon } = payload;
  toast(<p className="text-sm font-medium text-gray-900">{text}</p>, {
    position: 'top-right',
    icon,
  });
}

export function* watchNotifications() {
  yield takeEvery('NOTIFICATION', notification);
}
