// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { editUserProfile } from '@lib/api/users';
import { addPostHogLoadedListener } from '@common/Analytics';
import { setUser } from '@state/user';
import { getUserProfile } from '@state/selectors/user';
import AnalyticsEulaModal from './AnalyticsEulaModal';

const EULA_DISPLAYED_EVENT = 'eula_displayed';
const EULA_ACCEPTED_EVENT = 'eula_accepted';
const EULA_DECLINED_EVENT = 'eula_declined';
const EULA_TEMPORARY_DECLINED_EVENT = 'eula_temporary_declined';

export default function AnalyticsEula({
  analyticsConfigEnabled,
  analyticsCapture,
  isAnalyticsLoadedFunc,
}) {
  const dispatch = useDispatch();
  const { id: userID, analytics_eula_accepted } = useSelector(getUserProfile);
  const [analyticsEulaModalOpen, setAnalyticsEulaModalOpen] = useState(
    !analytics_eula_accepted
  );
  const [analyticsLoaded, setAnalyticsLoaded] = useState(isAnalyticsLoadedFunc);
  const [eulaUserElection, setEulaUserElection] = useState();
  // save initial eula accepted state, so further changes doesn't change event capturing
  const eulaRequiredRef = useRef(!analytics_eula_accepted);

  // wait until posthog is properly loaded. need to wait until posthog configuration
  // data has been loaded from GTM and this is an async task
  useEffect(() => {
    if (analyticsLoaded) return;
    const { cleanup } = addPostHogLoadedListener(() =>
      setAnalyticsLoaded(true)
    );
    return cleanup;
  }, [analyticsLoaded]);

  // capture event when posthog is loaded and the eula modal was open at some point
  useEffect(() => {
    if (!analyticsConfigEnabled || !analyticsLoaded || !eulaRequiredRef.current)
      return;
    analyticsCapture(userID, EULA_DISPLAYED_EVENT, {});
  }, [userID, analyticsConfigEnabled, analyticsLoaded, analyticsCapture]);

  // capture user election event when posthog is loaded and the user has clicked its option
  useEffect(() => {
    if (!analyticsLoaded || !eulaUserElection) return;
    analyticsCapture(userID, eulaUserElection, {});
    setEulaUserElection();
  }, [userID, analyticsLoaded, eulaUserElection, analyticsCapture]);

  if (!analyticsConfigEnabled) {
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
      isOpen={analyticsEulaModalOpen}
      onEnable={() => {
        setAnalyticsEulaModalOpen(false);
        updateAnalyticsEula({
          analytics_enabled: true,
          analytics_eula_accepted: true,
        });
        setEulaUserElection(EULA_ACCEPTED_EVENT);
      }}
      onCancel={(checked) => {
        setAnalyticsEulaModalOpen(false);
        setEulaUserElection(
          checked ? EULA_DECLINED_EVENT : EULA_TEMPORARY_DECLINED_EVENT
        );
        if (checked) {
          updateAnalyticsEula({
            analytics_eula_accepted: checked,
          });
        }
      }}
    />
  );
}
