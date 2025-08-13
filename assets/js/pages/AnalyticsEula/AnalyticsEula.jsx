import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { isAdmin } from '@lib/model/users';
import { editUserProfile } from '@lib/api/users';
import { getFromConfig } from '@lib/config/config';
import { setUser } from '@state/user';
import { getUserProfile } from '@state/selectors/user';
import AnalyticsEulaModal from './AnalyticsEulaModal';

const analyticsEnabledConfig = getFromConfig('analyticsEnabled');

export default function AnalyticsEula() {
  if (!analyticsEnabledConfig) {
    return null;
  }

  const { analytics_eula_accepted, username } = useSelector(getUserProfile);
  const [analyticsEulaModalOpen, setAnalyticsEulaModalOpen] = useState(
    !analytics_eula_accepted
  );
  const [checked, setChecked] = useState(false);

  const user = { username };
  const isDefaultAdmin = isAdmin(user);
  const dispatch = useDispatch();

  const updateAnalyticsEula = (params) => {
    editUserProfile(params)
      .then(({ data: userData }) => {
        dispatch(setUser(userData));
      })
      .catch(() => {});
  };

  return (
    <AnalyticsEulaModal
      isOpen={!isDefaultAdmin && analyticsEulaModalOpen}
      checked={checked}
      onChecked={() => setChecked((prev) => !prev)}
      onEnable={() => {
        setAnalyticsEulaModalOpen(false);
        updateAnalyticsEula({
          analytics_enabled: true,
          analytics_eula_accepted: true,
        });
      }}
      onCancel={() => {
        setAnalyticsEulaModalOpen(false);
        if (checked) {
          updateAnalyticsEula({
            analytics_eula_accepted: checked,
          });
        }
      }}
    />
  );
}
