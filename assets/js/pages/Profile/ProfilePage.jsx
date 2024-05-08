import React, { useEffect, useState } from 'react';
import PageHeader from '@common/PageHeader';
import ProfileForm from '@pages/Profile/ProfileForm';
import { getUserProfile } from '@lib/api/users';

function ProfilePage() {
  const [errorsState, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return <div>Loading...</div>;
  }
  const { fullname, email, username, abilities } = userState;

  return (
    <>
      <PageHeader className="font-bold mb-4">Profile</PageHeader>
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        errors={errorsState}
        loading={loading}
      />
    </>
  );
}

export default ProfilePage;
