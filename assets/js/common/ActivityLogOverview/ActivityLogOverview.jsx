import React from 'react';
import { format } from 'date-fns';
import Table from '@common/Table';

import {
  ACTIVITY_TYPES,
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
} from '@lib/model/activityLog';

const activityTypesLabels = {
  [LOGIN_ATTEMPT]: 'Login Attempt',
  [RESOURCE_TAGGING]: 'Tag Added',
  [RESOURCE_UNTAGGING]: 'Tag Removed',
  [API_KEY_GENERATION]: 'API Key Generated',
  [SAVING_SUMA_SETTINGS]: 'SUMA Settings Saved',
  [CHANGING_SUMA_SETTINGS]: 'SUMA Settings Changed',
  [CLEARING_SUMA_SETTINGS]: 'SUMA Settings Cleared',
  [USER_CREATION]: 'User Created',
  [USER_MODIFICATION]: 'User Modified',
  [USER_DELETION]: 'User Deleted',
  [PROFILE_UPDATE]: 'Profile Updated',
  [CLUSTER_CHECKS_EXECUTION_REQUEST]: 'Checks Execution Requested',
};

const resourceTypesLabels = {
  host: 'Host',
  cluster: 'Cluster',
  database: 'Database',
  sap_system: 'SAP System',
};

const toResource = (activityLogEntry) => {
  const { metadata, type } = activityLogEntry;
  switch (type) {
    case LOGIN_ATTEMPT:
      return 'Application';
    case RESOURCE_TAGGING:
    case RESOURCE_UNTAGGING:
      return resourceTypesLabels[metadata.resource_type];
    case USER_CREATION:
    case USER_MODIFICATION:
    case USER_DELETION:
      return 'User';
    case PROFILE_UPDATE:
      return 'Profile';
    case SAVING_SUMA_SETTINGS:
    case CHANGING_SUMA_SETTINGS:
    case CLEARING_SUMA_SETTINGS:
      return 'SUMA Settings';
    case API_KEY_GENERATION:
      return 'API Key';
    case CLUSTER_CHECKS_EXECUTION_REQUEST:
      return 'Cluster Checks';
    default:
      return 'Unrecognized resource';
  }
};

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

const activityLogTableConfig = {
  pagination: true,
  usePadding: false,
  columns: [
    {
      title: 'Time',
      key: 'occurred_on',
      render: (time) => format(time, 'yyyy-MM-dd HH:mm:ss'),
    },
    {
      title: 'Event Type',
      key: 'type',
      render: (type) => (
        <span aria-label="activity-log-type">
          {ACTIVITY_TYPES.includes(type)
            ? activityTypesLabels[type]
            : 'Unknown'}
        </span>
      ),
    },
    {
      title: 'Resource',
      key: 'metadata',
      render: (_, activityLogEntry) => (
        <span aria-label="activity-log-resource">
          {toResource(activityLogEntry)}
        </span>
      ),
    },
    {
      title: 'User',
      key: 'actor',
    },
    {
      title: 'Message',
      key: 'metadata',
      render: (_, activityLogEntry) => toMessage(activityLogEntry),
    },
  ],
  collapsibleDetailRenderer: ({ metadata }) => (
    <pre>{JSON.stringify(metadata, null, 2)}</pre>
  ),
};

export default function ActivityLogOverview({ activityLog }) {
  return <Table config={activityLogTableConfig} data={activityLog} />;
}
