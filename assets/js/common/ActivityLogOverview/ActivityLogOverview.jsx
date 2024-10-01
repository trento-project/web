import React, { useState } from 'react';
import { format, toZonedTime } from 'date-fns-tz';

import { EOS_KEYBOARD_ARROW_RIGHT_FILLED } from 'eos-icons-react';
import Table from '@common/Table';

import { toMessage } from '@lib/model/activityLog';

import ActivityLogDetailModal from '@common/ActivityLogDetailsModal';

// const logLevelToIcon = {
//   [LEVEL_DEBUG]: <EOS_BUG_REPORT_OUTLINED className="w-full" />,
//   [LEVEL_INFO]: <EOS_INFO_OUTLINED className="w-full" />,
//   [LEVEL_WARNING]: <EOS_WARNING_OUTLINED className="fill-yellow-500 w-full" />,
//   [LEVEL_ERROR]: <EOS_ERROR_OUTLINED className="fill-red-500 w-full" />,
// };
// const logLevelToLabel = {
//   [LEVEL_DEBUG]: 'Debug',
//   [LEVEL_INFO]: 'Info',
//   [LEVEL_WARNING]: 'Warning',
//   [LEVEL_ERROR]: 'Error',
// };

export const toRenderedEntry = (entry) => ({
  id: entry.id,
  type: entry.type,
  time: format(toZonedTime(entry.occurred_on), 'yyyy-MM-dd HH:mm:ss'),
  message: toMessage(entry),
  user: entry.actor,
  // level: ACTIVITY_LOG_LEVELS.includes(entry?.level) ? entry?.level : LEVEL_INFO,
  metadata: entry.metadata,
});

function ActivityLogOverview({ activityLog, loading = false }) {
  const [selectedEntry, setEntry] = useState({});
  const [activityLogDetailModalOpen, setActivityLogDetailModalOpen] =
    useState(false);

  const activityLogTableConfig = {
    usePadding: false,
    columns: [
      {
        title: 'Time',
        key: 'time',
        className: 'w-1/6',
      },
      {
        title: 'Message',
        key: 'message',
        className: 'w-3/6',
      },
      {
        title: 'User',
        key: 'user',
        className: 'w-2/12',
      },
      // {
      //   title: 'Level',
      //   key: 'level',
      //   className: 'text-center w-1/12',
      //   render: (level) => (
      //     <Tooltip content={logLevelToLabel[level] ?? 'Unknown'} wrap={false}>
      //       <span aria-label={`log-level-${level}`}>
      //         {logLevelToIcon[level]}
      //       </span>
      //     </Tooltip>
      //   ),
      // },
      {
        title: '',
        key: 'metadata',
        className: 'w-1/12',
        render: (_metadata, logEntry) => (
          <div
            aria-label={`entry-${logEntry.id}`}
            role="presentation"
            className="cursor-pointer w-full inline-block"
            onClick={() => {
              setEntry(logEntry);
              setActivityLogDetailModalOpen(true);
            }}
            onKeyDown={() => {}}
          >
            <EOS_KEYBOARD_ARROW_RIGHT_FILLED className="fill-gray-400 float-right" />
          </div>
        ),
      },
    ],
  };

  return (
    <>
      <ActivityLogDetailModal
        open={activityLogDetailModalOpen}
        entry={selectedEntry}
        onClose={() => setActivityLogDetailModalOpen(false)}
      />
      <Table
        config={activityLogTableConfig}
        data={activityLog.map(toRenderedEntry)}
        emptyStateText={loading ? 'Loading...' : 'No data available'}
      />
    </>
  );
}

export default ActivityLogOverview;
