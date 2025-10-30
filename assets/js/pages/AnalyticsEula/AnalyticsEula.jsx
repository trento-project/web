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
  const dispatch = useDispatch();
  const user = useSelector(getUserProfile);
  const { analytics_eula_accepted } = user;
  const [analyticsEulaModalOpen, setAnalyticsEulaModalOpen] = useState(
    !analytics_eula_accepted
  );

  const isDefaultAdmin = isAdmin(user);

  if (!analyticsEnabledConfig) {
    return null;
  }

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
      onEnable={() => {
        setAnalyticsEulaModalOpen(false);
        updateAnalyticsEula({
          analytics_enabled: true,
          analytics_eula_accepted: true,
        });
      }}
      onCancel={(checked) => {
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
