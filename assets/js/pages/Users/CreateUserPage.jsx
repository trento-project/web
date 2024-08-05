import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import BackButton from '@common/BackButton';
import PageHeader from '@common/PageHeader';
import NotFound from '@pages/NotFound';

import { isSingleSignOnEnabled } from '@lib/model/users';
import { listAbilities } from '@lib/api/abilities';
import { createUser } from '@lib/api/users';

import UserForm from './UserForm';

const ERROR_GETTING_ABILITIES = 'Error getting user abilities';
const SUCCESS_USER_CREATION = 'User created successfully';
const UNEXPECTED_ERROR_MESSAGE = 'Unexpected error occurred, refresh the page';

export const fetchAbilities = (setAbilities) => {
  listAbilities()
    .then(({ data }) => {
      setAbilities(data);
    })
    .catch(() => {
      toast.error(ERROR_GETTING_ABILITIES);
      setAbilities([]);
    });
};

function CreateUserPage() {
  const navigate = useNavigate();
  const [savingState, setSaving] = useState(false);
  const [errorsState, setErrors] = useState([]);
  const [abilitiesState, setAbilities] = useState([]);

  const onCreateUser = (payload) => {
    setSaving(true);
    createUser(payload)
      .then(() => {
        toast.success(SUCCESS_USER_CREATION);
        navigate('/users');
      })
      .catch((error) => {
        if (error.response) {
          const { errors } = error.response.data;
          setErrors(errors);
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

  if (isSingleSignOnEnabled()) {
    return <NotFound />;
  }

  useEffect(() => {
    fetchAbilities(setAbilities);
  }, []);

  return (
    <div>
      <BackButton url="/users">Back to Users</BackButton>
      <PageHeader className="font-bold">Create User</PageHeader>
      <UserForm
        abilities={abilitiesState}
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
