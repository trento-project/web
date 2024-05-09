import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import BackButton from '@common/BackButton';
import PageHeader from '@common/PageHeader';

import { listAbilities } from '@lib/api/abilities';
import { createUser } from '@lib/api/users';

import UserForm from './UserForm';

const ERROR_GETTING_ABILITIES = 'Error getting user abilities';

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
