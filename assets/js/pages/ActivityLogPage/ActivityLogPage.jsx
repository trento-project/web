import React, { useState } from 'react';

import PageHeader from '@common/PageHeader';
import ActivityLogOverview from '@common/ActivityLogOverview';

import { getActivityLog } from '@lib/api/activityLogs';

function ActivityLogPage() {
  const [activityLog, setActivityLog] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [activityLogDetailModalOpen, setActivityLogDetailModalOpen] =
    useState(false);
  const [currentPaginationData, setCurrentPaginationData] = useState({});

  const loadActivityLog = (filters) => {
    setLoading(true);
    getActivityLog(filters)
      .then((response) => {
        setActivityLog(response.data?.data ?? []);
        setCurrentPaginationData(response.data?.pagination ?? {});
      })
      .catch(() => setActivityLog([]))
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <PageHeader className="font-bold">Activity Log</PageHeader>
      <ActivityLogOverview
        activityLogDetailModalOpen={activityLogDetailModalOpen}
        activityLog={activityLog}
        loading={isLoading}
        onActivityLogEntryClick={() => setActivityLogDetailModalOpen(true)}
        onCloseActivityLogEntryDetails={() =>
          setActivityLogDetailModalOpen(false)
        }
        currentPaginationData={currentPaginationData}
        loadActivityLog={(filtersAndPagination) => {
          loadActivityLog(filtersAndPagination);
        }}
      />
    </>
  );
}

export default ActivityLogPage;
