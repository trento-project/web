import React, { useState, useEffect } from 'react';
import { noop } from 'lodash';
import { getError } from '@lib/api/validationErrors';
import Button from '@common/Button';
import Input from '@common/Input';
import Label from '@common/Label';
import Modal from '@common/Modal';
import MultiSelect from '@common/MultiSelect';
import ProfilePasswordChangeForm from '@pages/Profile/ProfilePasswordChangeForm';
import { REQUIRED_FIELD_TEXT, errorMessage, mapAbilities } from '@lib/forms';

function ProfileForm({
  fullName = '',
  emailAddress = '',
  username = '',
  abilities = [],
  errors,
  loading,
  disableForm,
  passwordModalOpen = false,
  togglePasswordModal = noop,
  onSave = noop,
}) {
  const [fullNameState, setFullName] = useState(fullName);
  const [fullNameErrorState, setFullNameError] = useState(null);
  const [emailAddressState, setEmailAddress] = useState(emailAddress);
  const [emailAddressErrorState, setEmailAddressError] = useState(null);

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
    };

    onSave(user);
  };

  useEffect(() => {
    setFullNameError(getError('fullname', errors));
    setEmailAddressError(getError('email', errors));
  }, [errors]);

  return (
    <div>
      <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg">
        <div className="grid grid-cols-6 gap-6">
          <Label className="col-start-1 col-span-1">Full Name</Label>
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
          <Label className="col-start-1 col-span-1">Email Address</Label>
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
          <Label className="col-start-1 col-span-1">Username</Label>
          <div className="col-start-2 col-span-3">
            <Input value={username} aria-label="username" disabled />
          </div>
          <Label className="col-start-1 col-span-1">Password</Label>
          <div className="col-start-2 col-span-3">
            <Button
              onClick={togglePasswordModal}
              type="primary-white"
              disabled={loading || disableForm}
            >
              Change Password
            </Button>
          </div>
          <Label className="col-start-1 col-span-1">Permissions</Label>
          <div className="col-start-2 col-span-3">
            <MultiSelect
              aria-label="permissions"
              placeholder=""
              values={mapAbilities(abilities)}
              disabled
              options={mapAbilities(abilities)}
            />
          </div>
        </div>
        <div className="flex flex-row w-80 space-x-2 mt-5">
          <Button
            disabled={loading || disableForm}
            type="default-fit"
            onClick={onSaveClicked}
          >
            Save
          </Button>
        </div>
      </div>
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
