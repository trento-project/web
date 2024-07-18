import React, { useState } from 'react';
import { noop } from 'lodash';
import { EOS_KEYBOARD_ARROW_RIGHT_FILLED } from 'eos-icons-react';
import Table from '@common/Table';

import {
  API_KEY_GENERATION,
  CHANGING_SUMA_SETTINGS,
  CLEARING_SUMA_SETTINGS,
  CLUSTER_CHECKS_EXECUTION_REQUEST,
  LOGIN_ATTEMPT,
  PROFILE_UPDATE,
  RESOURCE_TAGGING,
  RESOURCE_UNTAGGING,
  SAVING_SUMA_SETTINGS,
  USER_CREATION,
  USER_DELETION,
  USER_MODIFICATION,
  LEVEL_DEBUG,
  LEVEL_ERROR,
  LEVEL_INFO,
  LEVEL_WARNING,
} from '@lib/model/activityLog';

import ActivityLogDetailModal from '@common/ActivityLogDetailsModal';
import { format } from 'date-fns';

const toMessage = (activityLogEntry) => {
  const { metadata, type } = activityLogEntry;

  switch (type) {
    case LOGIN_ATTEMPT:
      return metadata?.reason ? 'Login failed' : 'User logged in';
    case RESOURCE_TAGGING:
      return `Tag "${metadata.added_tag}" added to "${metadata.resource_id}"`;
    case RESOURCE_UNTAGGING:
      return `Tag "${metadata.removed_tag}" removed from "${metadata.resource_id}"`;
    case USER_CREATION:
      return 'User was created';
    case USER_MODIFICATION:
      return 'User was modified';
    case USER_DELETION:
      return 'User was deleted';
    case PROFILE_UPDATE:
      return 'User modified profile';
    case SAVING_SUMA_SETTINGS:
      return 'SUMA Settings was saved';
    case CHANGING_SUMA_SETTINGS:
      return 'SUMA Settings was changed';
    case CLEARING_SUMA_SETTINGS:
      return 'SUMA Settings was cleared';
    case API_KEY_GENERATION:
      return 'API Key was generated';
    case CLUSTER_CHECKS_EXECUTION_REQUEST:
      return 'Checks execution requested for cluster';
    default:
      return 'Unrecognized activity';
  }
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
  time: format(entry.occurred_on, 'yyyy-MM-dd HH:mm:ss'),
  message: toMessage(entry),
  user: entry.actor,
  level: logLevelToLabel[entry.level] ?? 'Unknown',
  metadata: entry.metadata,
});

function ActivityLogOverview({
  activityLog,
  activityLogDetailModalOpen = false,
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
        onCancel={onCloseActivityLogEntryDetails}
      />
      <Table
        config={activityLogTableConfig}
        data={activityLog.map(toRenderedEntry)}
      />
    </>
  );
}

export default ActivityLogOverview;
