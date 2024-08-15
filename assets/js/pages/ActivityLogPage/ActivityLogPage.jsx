import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import PageHeader from '@common/PageHeader';
import ActivityLogOverview from '@common/ActivityLogOverview';
import ComposedFilter from '@common/ComposedFilter';

import { getActivityLog } from '@lib/api/activityLogs';
import { ACTIVITY_TYPES_CONFIG } from '@lib/model/activityLog';
import {
  filterValueToSearchParams,
  searchParamsToAPIParams,
  searchParamsToFilterValue,
} from './searchParams';

const filters = [
  {
    key: 'type',
    type: 'select',
    title: 'Resource type',
    options: Object.entries(ACTIVITY_TYPES_CONFIG).map(([key, value]) => [
      key,
      value.label,
    ]),
  },
  {
    key: 'from_date',
    title: 'older than',
    type: 'date',
    prefilled: true,
  },
  {
    key: 'to_date',
    title: 'newer than',
    type: 'date',
    prefilled: true,
  },
];

function ActivityLogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activityLog, setActivityLog] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [activityLogDetailModalOpen, setActivityLogDetailModalOpen] =
    useState(false);

  const fetchActivityLog = () => {
    setLoading(true);
    const params = searchParamsToAPIParams(searchParams);
    getActivityLog(params)
      .then((response) => {
        setActivityLog(response.data?.data ?? []);
      })
      .catch(() => setActivityLog([]))
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
          activityLog={activityLog}
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
