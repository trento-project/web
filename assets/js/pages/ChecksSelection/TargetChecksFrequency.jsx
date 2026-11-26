// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { capitalize } from 'lodash';

import ChecksFrequencySettingsModal from '@common/ChecksFrequencySettingsModal';
import SettingsLoader, { calculateStatus } from '@common/SettingsLoader';
import TargetChecksFrequencyConfig from '@common/TargetChecksFrequencyConfig';

import { fetchChecksFrequencySettings } from '@state/checksFrequencySettings';
import {
  fetchChecksSchedule,
  setChecksScheduleErrors,
  setEditingChecksSchedule,
  updateChecksSchedule,
} from '@state/checksSchedules';
import { getChecksFrequencySettings } from '@state/selectors/checksFrequencySettings';
import { getChecksSchedule } from '@state/selectors/checksSchedules';

/**
 * Show and change the checks frequency of a host or a cluster.
 * The global settings are loaded as well, as the system setting to show
 * and to go back to
 *
 * @param {"host"|"cluster"} props.targetType The type of the target
 * @param {string} props.targetID The ID of the target
 */
function TargetChecksFrequency({ targetType, targetID, userAbilities }) {
  const dispatch = useDispatch();
  const target = { targetType, targetID };

  const {
    data: schedule,
    loading,
    networkError,
    editing,
    errors,
  } = useSelector(getChecksSchedule(targetType, targetID));

  const {
    settings: { enabled: systemEnabled, frequency: systemFrequency },
    loading: systemLoading,
    networkError: systemNetworkError,
  } = useSelector(getChecksFrequencySettings);
  const systemSettings = { enabled: systemEnabled, frequency: systemFrequency };

  const fetchAll = useCallback(() => {
    dispatch(fetchChecksSchedule({ targetType, targetID }));
    dispatch(fetchChecksFrequencySettings());
  }, [dispatch, targetType, targetID]);

  useEffect(fetchAll, [fetchAll]);

  useEffect(
    () => () => {
      dispatch(
        setEditingChecksSchedule({ targetType, targetID, editing: false })
      );
    },
    [dispatch, targetType, targetID]
  );

  const clearErrors = () =>
    dispatch(setChecksScheduleErrors({ ...target, errors: [] }));

  return (
    <>
      <SettingsLoader
        sectionName={`${capitalize(targetType)} Check Executions`}
        status={calculateStatus(
          (!schedule && !networkError) || systemLoading,
          networkError || systemNetworkError
        )}
        onRetry={fetchAll}
      >
        <TargetChecksFrequencyConfig
          targetType={targetType}
          schedule={schedule}
          systemSettings={systemSettings}
          userAbilities={userAbilities}
          onEditClick={() => {
            clearErrors();
            dispatch(setEditingChecksSchedule({ ...target, editing: true }));
          }}
        />
      </SettingsLoader>
      <ChecksFrequencySettingsModal
        key={`target-checks-frequency-${editing}`}
        open={editing}
        loading={loading}
        errors={errors}
        systemSettings={systemSettings}
        initialUseSystemSetting={schedule?.global}
        initialEnabled={schedule?.enabled}
        initialFrequency={schedule?.frequency}
        onSave={(newSchedule) =>
          dispatch(updateChecksSchedule({ ...target, schedule: newSchedule }))
        }
        onClearErrors={clearErrors}
        onCancel={() => {
          clearErrors();
          dispatch(setEditingChecksSchedule({ ...target, editing: false }));
        }}
      />
    </>
  );
}

export default TargetChecksFrequency;
