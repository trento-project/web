import React from 'react';
import { toast } from 'react-hot-toast';

import { recordSaga } from '@lib/test-utils';
import { getNotification } from '@common/ToastNotifications';
import HealthIcon from '@common/HealthIcon';

import {
  notification,
  dismissableNotification,
  customNotification,
  dismissNotification,
} from './notifications';

jest.mock('@common/ToastNotifications', () => ({
  getNotification: jest.fn(() => <span>custom toast!</span>),
}));

jest.mock('react-hot-toast', () => ({
  toast: jest.fn(),
}));

describe('notifications saga', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('notification', () => {
    it('should send a notification toast', async () => {
      await recordSaga(notification, {
        payload: { id: 1, icon: '❌', text: 'toast!' },
      });

      expect(toast).toHaveBeenCalledWith(
        <p className="text-sm font-medium text-gray-900">toast!</p>,
        { duration: 4000, icon: '❌', id: 1, position: 'top-right' }
      );
    });

    it('should send a notification toast with a health icon', async () => {
      await recordSaga(notification, {
        payload: { id: 1, icon: 'warning', text: 'toast!', isHealthIcon: true },
      });

      expect(toast).toHaveBeenCalledWith(
        <p className="text-sm font-medium text-gray-900">toast!</p>,
        {
          duration: 4000,
          icon: <HealthIcon health="warning" />,
          id: 1,
          position: 'top-right',
        }
      );
    });
  });

  it('should send a dismissable notification', async () => {
    await recordSaga(dismissableNotification, {
      payload: { id: 1, icon: '❌', text: 'toast!' },
    });

    expect(toast).toHaveBeenCalledWith(expect.any(Function), {
      duration: 4000,
      icon: '❌',
      id: 1,
      position: 'top-right',
    });
  });

  describe('customNotification', () => {
    it('should send a notification toast with a custom component', async () => {
      await recordSaga(customNotification, {
        payload: { id: 1, icon: '❌', text: 'toast!' },
      });

      expect(getNotification).toHaveBeenCalledWith({
        id: 1,
        icon: '❌',
        text: 'toast!',
      });

      expect(toast).toHaveBeenCalledWith(<span>custom toast!</span>, {
        duration: 4000,
        icon: '❌',
        id: 1,
        position: 'top-right',
      });
    });
  });

  describe('dismissNotification', () => {
    it('should dismiss notification', async () => {
      toast.dismiss = jest.fn();

      await recordSaga(dismissNotification, {
        payload: { id: 1 },
      });

      expect(toast.dismiss).toHaveBeenCalledWith(1);
    });
  });
});
