import React, { useState, useEffect } from 'react';
import { capitalize, noop } from 'lodash';
import { format, parseISO } from 'date-fns';

import Button from '@common/Button';
import Input, { Password } from '@common/Input';
import Label from '@common/Label';
import Select from '@common/Select';

import { getError } from '@lib/api/validationErrors';

const USER_ENABLED = 'Enabled';
const REQUIRED_FIELD_TEXT = 'Required field';
const PASSWORD_PLACEHOLDER = '********';
const PASSWORD_POLICY_TEXT = (
  <div>
    The password must be compliant with:
    <br />
    - at least have 8 characters
    <br />
    - does not have 3 consecutive repeated numbers or letters (example: 111 or
    aaa)
    <br />- does not have 3 consecutive sequential numbers or letters (example:
    123 or abc)
  </div>
);

const defaultErrors = [];

const errorMessage = (message) => (
  <p className="text-red-500 mt-1">{capitalize(message)}</p>
);

function UserForm({
  fullName = '',
  emailAddress = '',
  username = '',
  status = 'Enabled',
  createdAt = '',
  updatedAt = '',
  errors = defaultErrors,
  saving = false,
  saveText = 'Create',
  editing = false,
  onSave = noop,
  onCancel = noop,
}) {
  const [fullNameState, setFullName] = useState(fullName);
  const [fullNameErrorState, setFullNameError] = useState(null);
  const [emailAddressState, setEmailAddress] = useState(emailAddress);
  const [emailAddressErrorState, setEmailAddressError] = useState(null);
  const [usernameState, setUsername] = useState(username);
  const [usernameErrorState, setUsernameError] = useState(null);
  const [passwordState, setPassword] = useState('');
  const [passwordErrorState, setPasswordError] = useState(null);
  const [confirmPasswordState, setConfirmPassword] = useState('');
  const [confirmPasswordErrorState, setConfirmPasswordError] = useState(null);
  const [statusState, setStatus] = useState(status);

  useEffect(() => {
    setFullNameError(getError('fullname', errors));
    setEmailAddressError(getError('email', errors));
    setUsernameError(getError('username', errors));
    setPasswordError(getError('password', errors));
    setConfirmPasswordError(getError('password_confirmation', errors));
  }, [errors]);

  const validateRequired = () => {
    let error = false;
    if (!fullNameState) {
      setFullNameError(REQUIRED_FIELD_TEXT);
      error = true;
    }

    if (!emailAddressState) {
      setEmailAddressError(REQUIRED_FIELD_TEXT);
      error = true;
    }

    if (!usernameState) {
      setUsernameError(REQUIRED_FIELD_TEXT);
      error = true;
    }

    if (!editing && !passwordState) {
      setPasswordError(REQUIRED_FIELD_TEXT);
      error = true;
    }

    if (!editing && !confirmPasswordState) {
      setConfirmPasswordError(REQUIRED_FIELD_TEXT);
      error = true;
    }

    return error;
  };

  const onSaveClicked = () => {
    if (validateRequired()) {
      return;
    }

    const user = {
      fullname: fullNameState,
      email: emailAddressState,
      enabled: statusState === USER_ENABLED,
      ...(!editing && { username: usernameState }),
      ...(passwordState && { password: passwordState }),
      ...(confirmPasswordState && {
        password_confirmation: confirmPasswordState,
      }),
    };

    onSave(user);
  };

  return (
    <div>
      <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg">
        <div className="grid grid-cols-6 gap-6">
          <Label className="col-start-1 col-span-1" required>
            Full Name
          </Label>
          <div className="col-start-2 col-span-3">
            <Input
              value={fullNameState}
              aria-label="fullname"
              placeholder="Enter full name"
              error={fullNameErrorState}
              onChange={({ target: { value } }) => {
                setFullName(value);
                setFullNameError(null);
              }}
            />
            {fullNameErrorState && errorMessage(fullNameErrorState)}
          </div>
          <Label className="col-start-1 col-span-1" required>
            Email Address
          </Label>
          <div className="col-start-2 col-span-3">
            <Input
              value={emailAddressState}
              aria-label="email"
              placeholder="Enter email address"
              error={emailAddressErrorState}
              onChange={({ target: { value } }) => {
                setEmailAddress(value);
                setEmailAddressError(null);
              }}
            />
            {emailAddressErrorState && errorMessage(emailAddressErrorState)}
          </div>
          <Label className="col-start-1 col-span-1" required>
            Username
          </Label>
          <div className="col-start-2 col-span-3">
            <Input
              value={usernameState}
              aria-label="username"
              placeholder="Enter username"
              error={usernameErrorState}
              onChange={({ target: { value } }) => {
                setUsername(value);
                setUsernameError(null);
              }}
              disabled={editing}
            />
            {usernameErrorState && errorMessage(usernameErrorState)}
          </div>
          <Label
            className="col-start-1 col-span-1"
            info={PASSWORD_POLICY_TEXT}
            required
          >
            Password
          </Label>
          <div className="col-start-2 col-span-3">
            <Password
              value={passwordState}
              aria-label="password"
              placeholder={editing ? PASSWORD_PLACEHOLDER : 'Enter password'}
              error={passwordErrorState}
              onChange={({ target: { value } }) => {
                setPassword(value);
                setPasswordError(null);
              }}
            />
            {passwordErrorState && errorMessage(passwordErrorState)}
          </div>
          <Label className="col-start-1 col-span-1" required>
            Confirm Password
          </Label>
          <div className="col-start-2 col-span-3">
            <Password
              value={confirmPasswordState}
              aria-label="password-confirmation"
              placeholder={editing ? PASSWORD_PLACEHOLDER : 'Re-enter password'}
              error={confirmPasswordErrorState}
              onChange={({ target: { value } }) => {
                setConfirmPassword(value);
                setConfirmPasswordError(null);
              }}
            />
            {confirmPasswordErrorState &&
              errorMessage(confirmPasswordErrorState)}
          </div>
          <Label className="col-start-1 col-span-1">Permissions</Label>
          <div className="col-start-2 col-span-3">
            <Input value="" placeholder="all:all" error={false} disabled />
          </div>
          <Label className="col-start-1 col-span-1">Status</Label>
          <div className="col-start-2 col-span-3">
            <Select
              optionsName="status"
              options={['Enabled', 'Disabled']}
              value={status}
              disabled
              onChange={({ target: { value } }) => {
                setStatus(value);
              }}
            />
          </div>
          {editing && (
            <>
              <Label className="col-start-1 col-span-1">Created</Label>
              <span className="col-start-2 col-span-3">
                {format(parseISO(createdAt), 'PPpp')}
              </span>
              <Label className="col-start-1 col-span-1">Updated</Label>
              <span className="col-start-2 col-span-3">
                {format(parseISO(updatedAt), 'PPpp')}
              </span>
            </>
          )}
          <p className="col-span-6">
            <span className="text-red-500">*</span> Required Fields
          </p>
        </div>
        <div className="flex flex-row w-80 space-x-2 mt-5">
          <Button disabled={saving} type="default-fit" onClick={onSaveClicked}>
            {saveText}
          </Button>
          <Button type="primary-white-fit" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UserForm;
