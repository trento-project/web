import React, { useState, useEffect } from 'react';

import PageHeader from '@common/PageHeader';
import ActivityLogOverview from '@common/ActivityLogOverview';

import { getActivityLog } from '@lib/api/activityLogs';

function ActivityLogPage() {
  const [activityLog, setActivityLog] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [activityLogDetailModalOpen, setActivityLogDetailModalOpen] =
    useState(false);

  useEffect(() => {
    getActivityLog()
      .then((response) => {
        setActivityLog(response.data);
      })
      .catch(() => setActivityLog([]))
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
      />
    </>
  );
}

export default ActivityLogPage;
