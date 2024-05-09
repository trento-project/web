import React, { useEffect, useState } from 'react';
import { noop } from 'lodash';

import Button from '@common/Button';
import { Password } from '@common/Input';
import Label from '@common/Label';
import { getError } from '@lib/api/validationErrors';

import {
  PASSWORD_POLICY_TEXT,
  PASSWORD_PLACEHOLDER,
  REQUIRED_FIELD_TEXT,
  errorMessage,
} from '@lib/forms';

function ProfilePasswordChangeForm({
  errors,
  loading,
  onSave = noop,
  onCancel = noop,
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);

  const validateRequired = () => {
    let error = false;
    if (!currentPassword) {
      setCurrentPasswordError(REQUIRED_FIELD_TEXT);
      error = true;
    }

    if (!password) {
      setPasswordError(REQUIRED_FIELD_TEXT);
      error = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(REQUIRED_FIELD_TEXT);
      error = true;
    }

    return error;
  };

  const onSaveClicked = () => {
    if (validateRequired()) {
      return;
    }

    const passwordChangePayload = {
      password,
      current_password: currentPassword,
      password_confirmation: confirmPassword,
    };

    onSave(passwordChangePayload);
  };

  useEffect(() => {
    setPasswordError(getError('password', errors));
    setCurrentPasswordError(getError('current_password', errors));
    setConfirmPasswordError(getError('password_confirmation', errors));
  }, [errors]);

  return (
    <div>
      <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg">
        <div className="grid gap-6">
          <Label className="col-start-1 col-span-1" required>
            Current Password
          </Label>
          <div className="col-start-2 col-span-3">
            <Password
              value={currentPassword}
              aria-label="current_password"
              placeholder={PASSWORD_PLACEHOLDER}
              error={currentPasswordError}
              onChange={({ target: { value } }) => {
                setCurrentPassword(value);
                setCurrentPasswordError(null);
              }}
            />
            {currentPasswordError && errorMessage(currentPasswordError)}
          </div>
          <Label
            className="col-start-1 col-span-1"
            info={PASSWORD_POLICY_TEXT}
            required
          >
            New Password
          </Label>
          <div className="col-start-2 col-span-3">
            <Password
              value={password}
              aria-label="password"
              placeholder={PASSWORD_PLACEHOLDER}
              error={passwordError}
              onChange={({ target: { value } }) => {
                setPassword(value);
                setPasswordError(null);
              }}
            />
            {passwordError && errorMessage(passwordError)}
          </div>
          <Label className="col-start-1 col-span-1" required>
            Confirm New Password
          </Label>
          <div className="col-start-2 col-span-3">
            <Password
              value={confirmPassword}
              aria-label="password_confirmation"
              placeholder={PASSWORD_PLACEHOLDER}
              error={confirmPasswordError}
              onChange={({ target: { value } }) => {
                setConfirmPassword(value);
                setConfirmPasswordError(null);
              }}
            />
            {confirmPasswordError && errorMessage(confirmPasswordError)}
          </div>
        </div>
        <div className="flex flex-row w-80 space-x-2 mt-5">
          <Button disabled={loading} type="default-fit" onClick={onSaveClicked}>
            Save
          </Button>
          <Button type="primary-white-fit" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePasswordChangeForm;
