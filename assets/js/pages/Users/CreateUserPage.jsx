import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BackButton from '@common/BackButton';
import PageHeader from '@common/PageHeader';

import { createUser } from '@lib/api/users';

import UserForm from './UserForm';

function CreateUserPage() {
  const navigate = useNavigate();
  const [savingState, setSaving] = useState(false);
  const [errorsState, setErrors] = useState([]);

  const onCreateUser = (payload) => {
    setSaving(true);
    createUser(payload)
      .then(() => {
        navigate('/users');
      })
      .catch(
        ({
          response: {
            data: { errors },
          },
        }) => {
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

  return (
    <div>
      <BackButton url="/users">Back to Users</BackButton>
      <PageHeader className="font-bold">Create User</PageHeader>
      <UserForm
        saveText="Create"
        saving={savingState}
        errors={errorsState}
        onSave={onCreateUser}
        onCancel={onCancel}
      />
    </div>
  );
}

export default CreateUserPage;
