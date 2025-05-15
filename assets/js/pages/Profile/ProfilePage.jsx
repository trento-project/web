import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import PageHeader from '@common/PageHeader';
import { isAdmin } from '@lib/model/users';
import { isSingleSignOnEnabled } from '@lib/auth/config';
import ProfileForm from '@pages/Profile/ProfileForm';
import {
  getUserProfile,
  editUserProfile,
  initiateTotpEnrolling,
  confirmTotpEnrolling,
  resetTotpEnrolling,
} from '@lib/api/users';
import {
  setUser as setUserInState,
  USER_PASSWORD_CHANGE_REQUESTED_NOTIFICATION_ID,
} from '@state/user';
import { dismissNotification } from '@state/notifications';
import { getAnalyticsEnabledConfig, optinCapturing } from '@lib/analytics';

const analyticsEnabledConfig = getAnalyticsEnabledConfig();

function ProfilePage() {
  const [errorsState, setErrors] = useState([]);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [totpBoxOpen, setTotpBoxOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userState, setUser] = useState(null);
  const [totpEnrollmentSecret, setTotpEnrollmentSecret] = useState('');
  const [totpEnrollmentQrData, setTotpEnrollmentQrData] = useState('');

  const dispatch = useDispatch();

  const loadUserProfile = () =>
    getUserProfile()
      .then(({ data: user }) => {
        setUser(user);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const passwordModalToggle = () => {
    setPasswordModalOpen((modalState) => !modalState);
    setErrors([]);
  };

  const verifyTotpEnrollment = async (enrollmentTotp) => {
    setSaving(true);
    setErrors([]);

    try {
      await confirmTotpEnrolling({ totp_code: enrollmentTotp });
      setSaving(false);
      await loadUserProfile();
      setTotpBoxOpen(false);
      toast.success('TOTP Enabled');
    } catch ({
      response: {
        data: {
          errors: [error],
        },
      },
    }) {
      // Transform the received error to known errors format
      setErrors([{ ...error, source: { pointer: '/totp_code' } }]);
    }
    setSaving(false);
  };

  const disableTotp = async () => {
    setSaving(true);
    setErrors([]);

    try {
      await resetTotpEnrolling();
      setSaving(false);
      toast.success('TOTP Disabled');
    } catch {
      toast.error('Error disabling totp, please refresh your profile.');
    }
    await loadUserProfile();
    setSaving(false);
  };

  const totpInitiateEnrolling = () => {
    setSaving(true);
    setErrors([]);
    initiateTotpEnrolling()
      .then(({ data: { secret, secret_qr_encoded } }) => {
        setTotpEnrollmentSecret(secret);
        setTotpEnrollmentQrData(secret_qr_encoded);
        setTotpBoxOpen(true);
      })
      .catch(() =>
        toast.error(
          'Error retrieving totp enrollment information, please refresh profile.'
        )
      )
      .finally(() => setSaving(false));
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
        optinCapturing(updatedUser.analytics_enabled);
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
  const {
    fullname,
    email,
    username,
    abilities,
    analytics_enabled: analyticsEnabled,
    totp_enabled: totpEnabled,
  } = userState;
  const isDefaultAdmin = isAdmin(userState);

  return (
    <>
      <PageHeader className="font-bold mb-4">Profile</PageHeader>
      <ProfileForm
        fullName={fullname}
        emailAddress={email}
        username={username}
        abilities={abilities}
        analyticsEnabledConfig={analyticsEnabledConfig}
        analyticsEnabled={analyticsEnabled}
        totpEnabled={totpEnabled}
        totpSecret={totpEnrollmentSecret}
        totpQrData={totpEnrollmentQrData}
        errors={errorsState}
        togglePasswordModal={passwordModalToggle}
        passwordModalOpen={passwordModalOpen}
        totpBoxOpen={totpBoxOpen}
        toggleTotpBox={setTotpBoxOpen}
        loading={loading || saving}
        disableForm={isDefaultAdmin}
        singleSignOnEnabled={isSingleSignOnEnabled()}
        onSave={updateProfile}
        onEnableTotp={totpInitiateEnrolling}
        onVerifyTotp={verifyTotpEnrollment}
        onResetTotp={disableTotp}
      />
    </>
  );
}

export default ProfilePage;
