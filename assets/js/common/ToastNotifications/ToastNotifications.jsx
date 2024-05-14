import React from 'react';

import { Link } from 'react-router-dom';
import HealthIcon from '@common/HealthIcon';

import { USER_PASSWORD_CHANGE_REQUESTED_NOTIFICATION_ID } from '@state/user';

const passwordChangeNotification = () => ({
  component: (
    <p className="text-sm font-medium text-gray-900">
      Password change is recommended.
      <br />
      Go to{' '}
      <Link to="/profile" className="text-jungle-green-500 hover:opacity-75">
        Profile
      </Link>
    </p>
  ),
  icon: <HealthIcon health="warning" />,
});

const customNotifications = {
  [USER_PASSWORD_CHANGE_REQUESTED_NOTIFICATION_ID]: passwordChangeNotification,
};

export const getNotification = (payload) =>
  customNotifications[payload.id](payload);
