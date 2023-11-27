import { createAction } from '@reduxjs/toolkit';

export const NOTIFICATION = 'NOTIFICATION';

export const notify = createAction(NOTIFICATION, ({ text, icon }) => ({
  payload: { text, icon },
}));
