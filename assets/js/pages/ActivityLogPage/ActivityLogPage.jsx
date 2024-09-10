import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { map, pipe } from 'lodash/fp';

import { getActivityLog } from '@lib/api/activityLogs';
import { allowedActivities } from '@lib/model/activityLog';
import { getActivityLogUsers } from '@state/selectors/activityLog';
import { getUserProfile } from '@state/selectors/user';

import PageHeader from '@common/PageHeader';
import ActivityLogOverview from '@common/ActivityLogOverview';
import ComposedFilter from '@common/ComposedFilter';

import {
  filterValueToSearchParams,
  searchParamsToAPIParams,
  searchParamsToFilterValue,
} from './searchParams';

const emptyResponse = { data: [] };

function ActivityLogPage() {
  const users = useSelector(getActivityLogUsers);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activityLogResponse, setActivityLogResponse] = useState(emptyResponse);
  const [isLoading, setLoading] = useState(true);
  const [activityLogDetailModalOpen, setActivityLogDetailModalOpen] =
    useState(false);
  const { abilities } = useSelector(getUserProfile);

  const filters = [
    {
      key: 'type',
      type: 'select',
      title: 'Resource type',
      options: pipe(
        allowedActivities,
        map(([key, value]) => [key, value.label])
      )(abilities),
    },
    {
      key: 'actor',
      type: 'select',
      title: 'User',
      options: users,
    },
    {
      key: 'to_date',
      title: 'newer than',
      type: 'date',
      prefilled: true,
    },
    {
      key: 'from_date',
      title: 'older than',
      type: 'date',
      prefilled: true,
    },
  ];

  const fetchActivityLog = () => {
    setLoading(true);
    const params = searchParamsToAPIParams(searchParams);
    getActivityLog(params)
      .then(({ data }) => {
        setActivityLogResponse({
          data: data?.data || [],
          pagination: data?.pagination,
        });
      })
      .catch(() => setActivityLogResponse(emptyResponse))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchActivityLog();
  }, [searchParams]);

  return (
    <>
      <PageHeader className="font-bold">Activity Log</PageHeader>
      <div className="bg-white rounded-lg shadow">
        <div style={{ padding: '1rem' }} />
        <div className="flex items-center px-4 space-x-4 pb-4">
          <ComposedFilter
            filters={filters}
            autoApply={false}
            value={searchParamsToFilterValue(searchParams)}
            onChange={(p) => setSearchParams(filterValueToSearchParams(p))}
          />
        </div>
        <ActivityLogOverview
          activityLogDetailModalOpen={activityLogDetailModalOpen}
          activityLog={activityLogResponse.data}
          loading={isLoading}
          onActivityLogEntryClick={() => setActivityLogDetailModalOpen(true)}
          onCloseActivityLogEntryDetails={() =>
            setActivityLogDetailModalOpen(false)
          }
        />
      </div>
    </>
  );
}

export default ActivityLogPage;
