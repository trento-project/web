import React from 'react';

import { Link } from 'react-router-dom';

import { USER_PASSWORD_CHANGE_REQUESTED_NOTIFICATION_ID } from '@state/user';

const passwordChangeNotification = () => (
  <p className="text-sm font-medium text-gray-900">
    Password change is recommended.
    <br />
    Go to{' '}
    <Link to="/profile" className="text-jungle-green-500 hover:opacity-75">
      Profile
    </Link>
  </p>
);

const customNotifications = {
  [USER_PASSWORD_CHANGE_REQUESTED_NOTIFICATION_ID]: passwordChangeNotification,
};

export const getNotification = (payload) =>
  customNotifications[payload.id](payload);
