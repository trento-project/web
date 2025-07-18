import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { noop } from 'lodash';
import { getError } from '@lib/api/validationErrors';
import Button from '@common/Button';
import Input from '@common/Input';
import Label from '@common/Label';
import Modal from '@common/Modal';
import Switch from '@common/Switch';
import AbilitiesMultiSelect from '@common/AbilitiesMultiSelect';
import ProfilePasswordChangeForm from '@pages/Profile/ProfilePasswordChangeForm';
import TotpEnrollementBox from '@pages/Profile/TotpEnrollmentBox';

import { REQUIRED_FIELD_TEXT, errorMessage } from '@lib/forms';

const ANALYTICS_TOOLTIP_MESSAGE = (
  <span>
    Allow the collection of{' '}
    <Link
      to="https://www.trento-project.io/docs/"
      className="text-jungle-green-500 hover:opacity-75"
      target="_blank"
    >
      anonymous metrics
    </Link>{' '}
    to help improve Trento.
  </span>
);

function ProfileForm({
  fullName = '',
  emailAddress = '',
  username = '',
  totpEnabled = false,
  totpSecret = '',
  totpQrData = '',
  abilities = [],
  analyticsEnabledConfig = false,
  analyticsEnabled = false,
  errors,
  loading,
  disableForm,
  passwordModalOpen = false,
  totpBoxOpen = false,
  singleSignOnEnabled = false,
  toggleTotpBox = noop,
  togglePasswordModal = noop,
  onSave = noop,
  onResetTotp = noop,
  onVerifyTotp = noop,
  onEnableTotp = noop,
}) {
  const [fullNameState, setFullName] = useState(fullName);
  const [fullNameErrorState, setFullNameError] = useState(null);
  const [emailAddressState, setEmailAddress] = useState(emailAddress);
  const [emailAddressErrorState, setEmailAddressError] = useState(null);
  const [totpDisableModalOpen, setTotpDisableModalOpen] = useState(false);
  const [analyticsEnabledState, setAnalyticsState] = useState(analyticsEnabled);

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

    return error;
  };

  const onSaveClicked = () => {
    if (validateRequired()) {
      return;
    }

    const user = {
      fullname: fullNameState,
      email: emailAddressState,
      analytics_enabled: analyticsEnabledState,
    };

    onSave(user);
  };

  const toggleTotp = () => {
    if (!totpEnabled) {
      onEnableTotp();
      return;
    }
    setTotpDisableModalOpen(true);
  };

  useEffect(() => {
    setFullNameError(getError('fullname', errors));
    setEmailAddressError(getError('email', errors));
  }, [errors]);

  return (
    <div>
      <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg">
        <div className="grid grid-cols-8 gap-6">
          <Label className="col-start-1 col-span-2 pt-2">Full Name</Label>
          <div className="col-start-3 col-span-4">
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
          <Label className="col-start-1 col-span-2 pt-2">Email Address</Label>
          <div className="col-start-3 col-span-4">
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
          <Label className="col-start-1 col-span-2 pt-2">Username</Label>
          <div className="col-start-3 col-span-4">
            <Input value={username} aria-label="username" disabled />
          </div>
          {!singleSignOnEnabled && (
            <>
              <Label className="col-start-1 col-span-2 pt-2">Password</Label>
              <div className="col-start-3 col-span-4">
                <Button
                  onClick={togglePasswordModal}
                  type="primary-white"
                  disabled={loading || disableForm || singleSignOnEnabled}
                >
                  Change Password
                </Button>
              </div>

              <Label
                className="col-start-1 col-span-2"
                info="Setup a multi-factor TOTP authentication besides your password to increase security
              for your account."
              >
                Authenticator App
              </Label>
              <div className="col-start-3 col-span-4">
                <div className="inline-flex">
                  <Switch
                    selected={totpEnabled}
                    onChange={toggleTotp}
                    disabled={loading || disableForm || totpBoxOpen}
                  />
                  {totpBoxOpen && (
                    <span
                      className="ml-5 cursor-pointer text-jungle-green-500 hover:opacity-75"
                      onClick={() => toggleTotpBox(false)}
                      aria-hidden="true"
                    >
                      Cancel
                    </span>
                  )}
                </div>

                {totpBoxOpen && (
                  <div className="col-start-2 col-span-3">
                    <TotpEnrollementBox
                      errors={errors}
                      qrData={totpQrData}
                      secret={totpSecret}
                      loading={loading}
                      verifyTotp={onVerifyTotp}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <Label className="col-start-1 col-span-2 pt-2">Permissions</Label>
          <div className="col-start-3 col-span-4">
            <AbilitiesMultiSelect
              userAbilities={abilities}
              abilities={abilities}
              placeholder=""
              disabled
            />
          </div>
          {analyticsEnabledConfig && (
            <>
              <Label
                className="col-start-1 col-span-2 pt-2"
                info={ANALYTICS_TOOLTIP_MESSAGE}
              >
                Analytics Opt-in
              </Label>
              <div className="col-start-3 col-span-4">
                <div className="pt-2">
                  <div className="flex items-center">
                    <Switch
                      selected={analyticsEnabledState}
                      disabled={loading || disableForm}
                      onChange={(value) => setAnalyticsState(value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {!singleSignOnEnabled && (
          <div className="flex flex-row w-80 space-x-2 mt-5">
            <Button
              disabled={loading || disableForm}
              type="default-fit"
              onClick={onSaveClicked}
            >
              Save
            </Button>
          </div>
        )}
      </div>
      <Modal
        title="Disable TOTP"
        className="!w-3/4 !max-w-3xl"
        open={totpDisableModalOpen}
        onClose={() => setTotpDisableModalOpen((opened) => !opened)}
      >
        <div className="flex flex-col my-2">
          <span className="font-semibold">
            Are you sure you want to disable TOTP?{' '}
          </span>
          <div className="w-1/6 h-4/5 flex mt-4">
            <Button
              type="danger-bold"
              className="mr-2"
              onClick={() => {
                onResetTotp();
                setTotpDisableModalOpen(false);
              }}
              disabled={loading}
            >
              Disable
            </Button>
            <Button
              type="primary-white"
              onClick={() => setTotpDisableModalOpen(false)}
              className=""
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        title="Change Password"
        className="!w-3/4 !max-w-3xl"
        open={passwordModalOpen}
        onClose={togglePasswordModal}
      >
        <ProfilePasswordChangeForm
          loading={loading}
          onSave={onSave}
          onCancel={togglePasswordModal}
          errors={errors}
        />
      </Modal>
    </div>
  );
}

export default ProfileForm;
