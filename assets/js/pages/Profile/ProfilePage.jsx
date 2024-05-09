import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import PageHeader from '@common/PageHeader';
import ProfileForm from '@pages/Profile/ProfileForm';
import { getUserProfile, updateUserProfile } from '@lib/api/users';

function ProfilePage() {
  const [errorsState, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userState, setUser] = useState(null);

  useEffect(() => {
    getUserProfile()
      .then(({ data: user }) => {
        setUser(user);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const updateProfile = (payload) => {
    setSaving(true);
    updateUserProfile(payload)
      .then(({ data: updatedUser }) => {
        toast.success('Profile changes saved!');
        setUser(updatedUser);
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

  if (loading) {
    return <div>Loading...</div>;
  }
  const { fullname, email, username, abilities, id } = userState;
  const isDefaultAdmin = id === 1;

  return (
    <>
      <PageHeader className="font-bold mb-4">Profile</PageHeader>
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        errors={errorsState}
        loading={loading || saving}
        disableForm={isDefaultAdmin}
        onSave={updateProfile}
      />
    </>
  );
}

export default ProfilePage;
