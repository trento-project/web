import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import BackButton from '@common/BackButton';
import Banner from '@common/Banners/Banner';
import PageHeader from '@common/PageHeader';

import { isAdmin } from '@lib/model/users';
import { editUser, getUser } from '@lib/api/users';

import UserForm from './UserForm';

function EditUserPage() {
  const { userID } = useParams();
  const navigate = useNavigate();
  const [savingState, setSaving] = useState(false);
  const [errorsState, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userState, setUser] = useState(null);
  const [userVersion, setUserVersion] = useState(null);
  const [updatedByOther, setUpdatedByOther] = useState(false);

  useEffect(() => {
    getUser(userID)
      .then(({ data: user, headers: { etag } }) => {
        setUserVersion(etag);
        setUser(user);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [userID]);

  const onEditUser = (payload) => {
    setSaving(true);
    editUser(userID, payload, userVersion)
      .then(() => {
        navigate('/users');
      })
      .catch(
        ({
          response: {
            status,
            data: { errors },
          },
        }) => {
          if (status === 412) {
            setUpdatedByOther(true);
            return;
          }
          setErrors(errors);
        }
      )
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
    created_at: createdAt,
    updated_at: updatedAt,
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
        saveText="Edit"
        fullName={fullname}
        emailAddress={email}
        username={username}
        status={enabled ? 'Enabled' : 'Disabled'}
        createdAt={createdAt}
        updatedAt={updatedAt}
        saveEnabled={!isAdmin(userState)}
        saving={savingState}
        errors={errorsState}
        onSave={onEditUser}
        onCancel={onCancel}
        editing
      />
    </div>
  );
}

export default EditUserPage;
