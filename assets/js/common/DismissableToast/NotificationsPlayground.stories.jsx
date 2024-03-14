import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import * as ICONS from 'eos-icons-react';
import Input from '@common/Input';
import Label from '@common/Label';
import Switch from '@common/Switch';
import Button from '@common/Button';

import DismissableToast from './DismissableToast';

function NotificationsPlayground() {
  const [toastDismissable, setToastDismissable] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [notificationIcon, setNotificationIcon] = useState('');
  const [notificationClassName, setNotificationClassName] = useState('');

  const [notificationIconNotFound, setNotificationIconNotFound] =
    useState(false);

  const showNotification = () => {
    setNotificationIconNotFound(false);
    if (!ICONS[notificationIcon]) {
      setNotificationIconNotFound(true);
      return;
    }
    const IconComponent = ICONS[notificationIcon];
    if (toastDismissable) {
      toast(
        (t) => <DismissableToast text={notificationText} toastID={t.id} />,
        {
          position: 'top-right',
          icon: <IconComponent className={notificationClassName} />,
          id: new Date().toISOString(),
          duration: Infinity,
        }
      );
      return;
    }

    toast(
      <p className="text-sm font-medium text-gray-900">{notificationText}</p>,
      {
        position: 'top-right',
        icon: <IconComponent className={notificationClassName} />,
        id: new Date().toISOString(),
        duration: 2000,
      }
    );
  };
  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col my-2 mb-4">
        <div className="inline-block w-full max-w-7xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-lg rounded-lg">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-8">
            {' '}
            Notifications playground{' '}
          </h3>
          <div className="flex space-x-1 my-4 mb-8">
            <div className="w-1/5">
              <Label>Dismissable</Label>
            </div>
            <div className="!ml-auto">
              <Switch
                selected={toastDismissable}
                onChange={() => {
                  setToastDismissable((enabled) => !enabled);
                }}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-1/3">
              <Label>Notification Text</Label>
            </div>

            <Input
              value={notificationText}
              onChange={({ target: { value } }) => {
                setNotificationText(value);
              }}
            />
          </div>

          <div className="flex items-center space-x-2 mb-8">
            <div className="w-1/3">
              <Label>Notification Classname</Label>
            </div>

            <Input
              value={notificationClassName}
              onChange={({ target: { value } }) => {
                setNotificationClassName(value);
              }}
            />
          </div>

          <div className="flex items-center space-x-2 mb-8">
            <div className="w-1/3">
              <Label>Notification Icon name</Label>
            </div>

            <Input
              value={notificationIcon}
              error={notificationIconNotFound}
              onChange={({ target: { value } }) => {
                setNotificationIcon(value);
              }}
            />
          </div>
          {notificationIconNotFound && (
            <span className="my-1 mb-9 text-red-500"> Invalid icon name</span>
          )}
          <div className="w-1/5 ">
            <Button type="primary-white" onClick={showNotification}>
              Show Notification
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default {
  title: 'Playgrounds/Notifications',
  component: NotificationsPlayground,
};

export function Default() {
  return <NotificationsPlayground />;
}
