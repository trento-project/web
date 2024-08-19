import React, { useState } from 'react';
import { noop } from 'lodash';
import { format, toZonedTime } from 'date-fns-tz';

import {
  EOS_BUG_REPORT_OUTLINED,
  EOS_ERROR_OUTLINED,
  EOS_INFO_OUTLINED,
  EOS_KEYBOARD_ARROW_RIGHT_FILLED,
  EOS_WARNING_OUTLINED,
} from 'eos-icons-react';
import Table from '@common/Table';
import Tooltip from '@common/Tooltip';

import {
  ACTIVITY_LOG_LEVELS,
  LEVEL_DEBUG,
  LEVEL_ERROR,
  LEVEL_INFO,
  LEVEL_WARNING,
  toMessage,
} from '@lib/model/activityLog';

import ActivityLogDetailModal from '@common/ActivityLogDetailsModal';

const logLevelToIcon = {
  [LEVEL_DEBUG]: <EOS_BUG_REPORT_OUTLINED className="w-full" />,
  [LEVEL_INFO]: <EOS_INFO_OUTLINED className="w-full" />,
  [LEVEL_WARNING]: <EOS_WARNING_OUTLINED className="fill-yellow-500 w-full" />,
  [LEVEL_ERROR]: <EOS_ERROR_OUTLINED className="fill-red-500 w-full" />,
};
const logLevelToLabel = {
  [LEVEL_DEBUG]: 'Debug',
  [LEVEL_INFO]: 'Info',
  [LEVEL_WARNING]: 'Warning',
  [LEVEL_ERROR]: 'Error',
};

export const toRenderedEntry = (entry) => ({
  id: entry.id,
  type: entry.type,
  time: format(toZonedTime(entry.occurred_on), 'yyyy-MM-dd HH:mm:ss'),
  message: toMessage(entry),
  user: entry.actor,
  level: ACTIVITY_LOG_LEVELS.includes(entry?.level) ? entry?.level : LEVEL_INFO,
  metadata: entry.metadata,
});

function ActivityLogOverview({
  activityLog,
  activityLogDetailModalOpen = false,
  loading = false,
  onActivityLogEntryClick = noop,
  onCloseActivityLogEntryDetails = noop,
}) {
  const [selectedEntry, setEntry] = useState({});

  const activityLogTableConfig = {
    pagination: true,
    usePadding: false,
    columns: [
      {
        title: 'Time',
        key: 'time',
      },
      {
        title: 'Message',
        key: 'message',
      },
      {
        title: 'User',
        key: 'user',
      },
      {
        title: 'Level',
        key: 'level',
        className: 'text-center',
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
        render: (_metadata, logEntry) => (
          <div
            aria-label={`entry-${logEntry.id}`}
            role="presentation"
            className="cursor-pointer w-full inline-block"
            onClick={() => {
              setEntry(logEntry);
              onActivityLogEntryClick();
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
        onClose={onCloseActivityLogEntryDetails}
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
