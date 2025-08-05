import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { isAdmin } from '@lib/model/users';
import { editUserProfile } from '@lib/api/users';
import { getUserProfile } from '@state/selectors/user';
import HomeHealthSummary from './HomeHealthSummary';
import AnalyticsEulaModal from '../AnalyticsEulaModal';

export function HomeHealthSummaryPage() {
  const { loading, sapSystemsHealth } = useSelector(
    (state) => state.sapSystemsHealthSummary
  );

  const { analytics_eula_accepted, username } = useSelector(getUserProfile);
  const [analyticsEulaModalOpen, setAnalyticsEulaModalOpen] = useState(
    !analytics_eula_accepted
  );
  const [checked, setChecked] = useState(false);

  const user = { username };
  const isDefaultAdmin = isAdmin(user);

  return (
    <div>
      <AnalyticsEulaModal
        isOpen={!isDefaultAdmin && analyticsEulaModalOpen}
        checked={checked}
        onChecked={() => setChecked((prev) => !prev)}
        onEnable={() => {
          setAnalyticsEulaModalOpen(false);
          editUserProfile({
            analytics_enabled: true,
            analytics_eula_accepted: true,
          });
        }}
        onCancel={() => {
          setAnalyticsEulaModalOpen(false);
          if (checked) {
            editUserProfile({
              analytics_eula_accepted: checked,
            });
          }
        }}
      />
      <HomeHealthSummary
        sapSystemsHealth={sapSystemsHealth}
        loading={loading}
      />
    </div>
  );
}
