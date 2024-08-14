import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import PageHeader from '@common/PageHeader';
import ActivityLogOverview from '@common/ActivityLogOverview';
import ComposedFilter from '@common/ComposedFilter';

import { getActivityLog } from '@lib/api/activityLogs';
import { ACTIVITY_TYPES_CONFIG } from '@lib/model/activityLog';

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
    title: 'From date',
    type: 'date',
    prefilled: true,
  },
];

const removeUndefinedFields = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => typeof v !== 'undefined')
  );

const searchParamsToFilters = (searchParams) =>
  [...searchParams.entries()].reduce(
    (acc, [key, value]) => ({ ...acc, [key]: [...(acc[key] || []), value] }),
    {}
  );

const filtersToParams = (selectedFilters) =>
  Object.entries(selectedFilters).reduce((acc, [key, value]) => {
    switch (key) {
      case 'from_date':
        return { ...acc, from_date: new Date(value[1]).toISOString() };
      default:
        return { ...acc, [key]: value };
    }
  }, {});

function ActivityLogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activityLog, setActivityLog] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [activityLogDetailModalOpen, setActivityLogDetailModalOpen] =
    useState(false);

  const fetchActivityLog = (selectedFilters) => {
    setLoading(true);
    getActivityLog(filtersToParams(selectedFilters))
      .then((response) => {
        setActivityLog(response.data?.data ?? []);
      })
      .catch(() => setActivityLog([]))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchActivityLog(searchParamsToFilters(searchParams));
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
            value={searchParamsToFilters(searchParams)}
            onChange={(p) => setSearchParams(removeUndefinedFields(p))}
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
