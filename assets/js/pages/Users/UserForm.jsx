import React, { useState, useEffect } from 'react';
import { noop } from 'lodash';
import { format, parseISO } from 'date-fns';

import Button from '@common/Button';
import Input, { Password } from '@common/Input';
import Label from '@common/Label';
import AbilitiesMultiSelect from '@common/AbilitiesMultiSelect';
import Select from '@common/Select';
import Tooltip from '@common/Tooltip';
import {
  PASSWORD_POLICY_TEXT,
  PASSWORD_PLACEHOLDER,
  REQUIRED_FIELD_TEXT,
  errorMessage,
} from '@lib/forms';
import { getError } from '@lib/api/validationErrors';

import { generateValidPassword } from './generatePassword';

const USER_ENABLED = 'Enabled';

const defaultAbilities = [];
const defaultErrors = [];

function UserForm({
  fullName = '',
  emailAddress = '',
  username = '',
  status = 'Enabled',
  abilities = defaultAbilities,
  userAbilities = defaultAbilities,
  createdAt = '',
  updatedAt = '',
  totpEnabledAt = '',
  errors = defaultErrors,
  saving = false,
  saveEnabled = true,
  saveText = 'Create',
  editing = false,
  singleSignOnEnabled = false,
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
  const [totpState, setTotpState] = useState(Boolean(totpEnabledAt));
  const [selectedAbilities, setAbilities] = useState(
    userAbilities.map(({ id }) => id)
  );

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

  const buildUserPayload = () => ({
    fullname: fullNameState,
    email: emailAddressState,
    enabled: statusState === USER_ENABLED,
    ...(!editing && { username: usernameState }),
    ...(passwordState && { password: passwordState }),
    ...(confirmPasswordState && {
      password_confirmation: confirmPasswordState,
    }),
    abilities: abilities.filter(({ id }) => selectedAbilities.includes(id)),
    ...(totpEnabledAt && !totpState && { totp_disabled: true }),
  });

  const buildSSOUserPayload = () => ({
    enabled: statusState === USER_ENABLED,
    abilities: abilities.filter(({ id }) => selectedAbilities.includes(id)),
  });

  const onSaveClicked = () => {
    if (validateRequired()) {
      return;
    }

    const user = singleSignOnEnabled
      ? buildSSOUserPayload()
      : buildUserPayload();

    onSave(user);
  };

  const onGeneratePassword = () => {
    const newPassword = generateValidPassword();
    setPassword(newPassword);
    setConfirmPassword(newPassword);
  };

  return (
    <div>
      <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg">
        <div className="grid grid-cols-6 gap-6">
          <Label className="col-start-1 col-span-1 sm:pt-2" required>
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
              disabled={singleSignOnEnabled}
            />
            {fullNameErrorState && errorMessage(fullNameErrorState)}
          </div>
          <Label className="col-start-1 col-span-1 sm:pt-2" required>
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
              disabled={singleSignOnEnabled}
            />
            {emailAddressErrorState && errorMessage(emailAddressErrorState)}
          </div>
          <Label className="col-start-1 col-span-1 sm:pt-2" required>
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
              disabled={editing || singleSignOnEnabled}
            />
            {usernameErrorState && errorMessage(usernameErrorState)}
          </div>
          {!singleSignOnEnabled && (
            <>
              <Label
                className="col-start-1 col-span-1 sm:pt-2"
                info={PASSWORD_POLICY_TEXT}
                required
              >
                Password
              </Label>
              <div className="col-start-2 col-span-3">
                <Password
                  value={passwordState}
                  aria-label="password"
                  placeholder={
                    editing ? PASSWORD_PLACEHOLDER : 'Enter password'
                  }
                  error={passwordErrorState}
                  onChange={({ target: { value } }) => {
                    setPassword(value);
                    setPasswordError(null);
                  }}
                />
                {passwordErrorState && errorMessage(passwordErrorState)}
              </div>
              <Label className="col-start-1 col-span-1 sm:pt-2" required>
                Confirm Password
              </Label>
              <div className="col-start-2 col-span-3">
                <Password
                  value={confirmPasswordState}
                  aria-label="password-confirmation"
                  placeholder={
                    editing ? PASSWORD_PLACEHOLDER : 'Re-enter password'
                  }
                  error={confirmPasswordErrorState}
                  onChange={({ target: { value } }) => {
                    setConfirmPassword(value);
                    setConfirmPasswordError(null);
                  }}
                />
                {confirmPasswordErrorState &&
                  errorMessage(confirmPasswordErrorState)}
              </div>
              <div className="col-start-2 col-span-3">
                <Button
                  type="primary-white"
                  onClick={onGeneratePassword}
                  disabled={!saveEnabled}
                >
                  Generate Password
                </Button>
              </div>
            </>
          )}
          <Label className="col-start-1 col-span-1 sm:pt-2">Permissions</Label>
          <div className="col-start-2 col-span-3">
            <AbilitiesMultiSelect
              userAbilities={userAbilities}
              abilities={abilities}
              placeholder="Default"
              setAbilities={setAbilities}
            />
          </div>
          <Label className="col-start-1 col-span-1 sm:pt-2">Status</Label>
          <div className="col-start-2 col-span-3">
            <Select
              optionsName="status"
              options={['Enabled', 'Disabled']}
              value={statusState}
              onChange={(value) => {
                setStatus(value);
              }}
            />
          </div>
          {editing && !singleSignOnEnabled && (
            <>
              <Label
                className="col-start-1 col-span-1 sm:pt-2"
                htmlFor="totp"
                aria-label="totp"
              >
                TOTP
              </Label>
              <div className="col-start-2 col-span-3">
                <Select
                  optionsName="totp"
                  options={[
                    { value: 'Enabled', disabled: !totpEnabledAt },
                    'Disabled',
                  ]}
                  value={totpState ? 'Enabled' : 'Disabled'}
                  onChange={(value) => {
                    setTotpState(value === 'Enabled');
                  }}
                />
              </div>
              <Label className="col-start-1 col-span-1 sm:pt-2">Created</Label>
              <span className="col-start-2 col-span-3">
                {format(parseISO(createdAt), 'PPpp')}
              </span>
              <Label className="col-start-1 col-span-1 sm:pt-2">Updated</Label>
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
          <Tooltip
            content="Admin user cannot be edited"
            isEnabled={!saveEnabled}
          >
            <Button
              disabled={!saveEnabled || saving}
              type="default-fit"
              onClick={onSaveClicked}
            >
              {saveText}
            </Button>
          </Tooltip>
          <Button type="primary-white-fit" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UserForm;
