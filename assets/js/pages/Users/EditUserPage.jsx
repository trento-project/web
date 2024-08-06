import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import BackButton from '@common/BackButton';
import Banner from '@common/Banners/Banner';
import PageHeader from '@common/PageHeader';

import { isAdmin } from '@lib/model/users';
import { isSingleSignOnEnabled } from '@lib/auth/config';

import { editUser, getUser } from '@lib/api/users';

import { fetchAbilities } from './CreateUserPage';
import UserForm from './UserForm';

const SUCCESS_EDIT_MESSAGE = 'User edited successfully';
const UNEXPECTED_ERROR_MESSAGE = 'Unexpected error occurred, refresh the page';

function EditUserPage() {
  const { userID } = useParams();
  const navigate = useNavigate();
  const [savingState, setSaving] = useState(false);
  const [errorsState, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userState, setUser] = useState(null);
  const [userVersion, setUserVersion] = useState(null);
  const [updatedByOther, setUpdatedByOther] = useState(false);
  const [abilitiesState, setAbilities] = useState([]);

  useEffect(() => {
    getUser(userID)
      .then(({ data: user, headers: { etag } }) => {
        setUserVersion(etag);
        setUser(user);
      })
      .catch(() => {
        toast.error(UNEXPECTED_ERROR_MESSAGE);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userID]);

  useEffect(() => {
    fetchAbilities(setAbilities);
  }, []);

  const onEditUser = (payload) => {
    setSaving(true);
    editUser(userID, payload, userVersion)
      .then(() => {
        toast.success(SUCCESS_EDIT_MESSAGE);
        navigate('/users');
      })
      .catch((error) => {
        if (error.response) {
          const { data, status } = error.response;
          if (status === 412) {
            setUpdatedByOther(true);
            return;
          }
          setErrors(data.errors);

          return;
        }
        toast.error(UNEXPECTED_ERROR_MESSAGE);
      })

      .finally(() => {
        setSaving(false);
      });
  };

  const onCancel = () => {
    navigate('/users');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userState) {
    return <div>Not found</div>;
  }

  const {
    fullname,
    email,
    username,
    enabled,
    abilities: userAbilities,
    created_at: createdAt,
    updated_at: updatedAt,
    totp_enabled_at: totpEnabledAt,
  } = userState;

  return (
    <div>
      <BackButton url="/users">Back to Users</BackButton>
      {updatedByOther && (
        <Banner type="warning">
          <span className="text-sm">
            Information has been updated by another user and your changes have
            not been saved. Please refresh the page to load the latest of
            information.
          </span>
        </Banner>
      )}
      <PageHeader className="font-bold">Edit User</PageHeader>
      <UserForm
        abilities={abilitiesState}
        userAbilities={userAbilities}
        saveText="Save"
        fullName={fullname}
        emailAddress={email}
        username={username}
        status={enabled ? 'Enabled' : 'Disabled'}
        createdAt={createdAt}
        updatedAt={updatedAt}
        totpEnabledAt={totpEnabledAt}
        saveEnabled={!isAdmin(userState)}
        saving={savingState}
        errors={errorsState}
        onSave={onEditUser}
        onCancel={onCancel}
        editing
        singleSignOnEnabled={isSingleSignOnEnabled()}
      />
    </div>
  );
}

export default EditUserPage;
