import { createAction } from '@reduxjs/toolkit';

export const NOTIFICATION = 'NOTIFICATION';
export const DISMISSABLE_NOTIFICATION = 'DISMISSABLE_NOTIFICATION';
export const DISMISS_NOTIFICATION = 'DISMISS_NOTIFICATION';

export const notify = createAction(
  NOTIFICATION,
  ({ text, icon, id, duration }) => ({
    payload: { text, icon, id, duration },
  })
);

export const dismissableNotify = createAction(
  DISMISSABLE_NOTIFICATION,
  ({ text, icon, id, duration }) => ({
    payload: { text, icon, id, duration },
  })
);

export const dismissNotification = createAction(
  DISMISS_NOTIFICATION,
  ({ notificationID }) => ({
    payload: { notificationID },
  })
);
