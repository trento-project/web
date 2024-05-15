import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import PageHeader from '@common/PageHeader';
import { isAdmin } from '@lib/model/users';
import ProfileForm from '@pages/Profile/ProfileForm';
import { getUserProfile, editUserProfile } from '@lib/api/users';
import {
  setUser as setUserInState,
  USER_PASSWORD_CHANGE_REQUESTED_NOTIFICATION_ID,
} from '@state/user';
import { dismissNotification } from '@state/notifications';

function ProfilePage() {
  const [errorsState, setErrors] = useState([]);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userState, setUser] = useState(null);
  const dispatch = useDispatch();

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

  const passwordModalToggle = () => {
    setPasswordModalOpen((modalState) => !modalState);
    setErrors([]);
  };

  const updateProfile = (payload) => {
    setSaving(true);
    setErrors([]);
    editUserProfile(payload)
      .then(({ data: updatedUser }) => {
        toast.success('Profile changes saved!');
        setUser(updatedUser);
        dispatch(setUserInState(updatedUser));
        setPasswordModalOpen(false);
        if (!updatedUser.password_change_requested) {
          dispatch(
            dismissNotification(USER_PASSWORD_CHANGE_REQUESTED_NOTIFICATION_ID)
          );
        }
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
  const { fullname, email, username, abilities } = userState;
  const isDefaultAdmin = isAdmin(userState);

  return (
    <>
      <PageHeader className="font-bold mb-4">Profile</PageHeader>
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        errors={errorsState}
        togglePasswordModal={passwordModalToggle}
        passwordModalOpen={passwordModalOpen}
        loading={loading || saving}
        disableForm={isDefaultAdmin}
        onSave={updateProfile}
      />
    </>
  );
}

export default ProfilePage;
