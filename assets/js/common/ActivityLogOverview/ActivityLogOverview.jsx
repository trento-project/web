import React, { useState } from 'react';
import { format } from 'date-fns';
import { utc } from '@date-fns/utc';

import {
  EOS_KEYBOARD_ARROW_RIGHT_FILLED,
  EOS_BUG_REPORT_OUTLINED,
  EOS_INFO_OUTLINED,
  EOS_WARNING_OUTLINED,
  EOS_ERROR_OUTLINED,
} from 'eos-icons-react';
import Table from '@common/Table';
import Tooltip from '@common/Tooltip';

import {
  toMessage,
  LEVEL_DEBUG,
  LEVEL_INFO,
  LEVEL_WARNING,
  LEVEL_CRITICAL,
  logLevelToLabel,
} from '@lib/model/activityLog';

import ActivityLogDetailModal from '@common/ActivityLogDetailsModal';

const logLevelToIcon = {
  [LEVEL_DEBUG]: <EOS_BUG_REPORT_OUTLINED className="w-full" />,
  [LEVEL_INFO]: <EOS_INFO_OUTLINED className="w-full" />,
  [LEVEL_WARNING]: <EOS_WARNING_OUTLINED className="fill-yellow-500 w-full" />,
  [LEVEL_CRITICAL]: <EOS_ERROR_OUTLINED className="fill-red-500 w-full" />,
};

export const toRenderedEntry = (entry) => ({
  id: entry.id,
  type: entry.type,
  time: format(new Date(entry.occurred_on), 'yyyy-MM-dd HH:mm:ss', { in: utc }),
  message: toMessage(entry),
  user: entry.actor,
  severity: entry.severity,
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
      {
        title: 'Severity',
        key: 'severity',
        className: 'text-center w-1/12',
        render: (level) => (
          <Tooltip content={logLevelToLabel[level] ?? 'Unknown'} wrap={false}>
            <span aria-label={`log-level-${level}`}>
              {logLevelToIcon[level]}
            </span>
          </Tooltip>
        ),
      },
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
