import React, { useState, useEffect } from 'react';

import { logError } from '@lib/log';

import Table from '@common/Table';
import { getActivityLog } from '../../lib/api/activityLogs';
import ActivityLogOverview from '../../common/ActivityLogOverview/ActivityLogOverview';
import { format } from 'date-fns';

// @type activity_type ::
// :login_attempt
// | :resource_tagging
// | :resource_untagging
// | :api_key_generation
// | :saving_suma_settings
// | :changing_suma_settings
// | :clearing_suma_settings
// | :user_creation
// | :user_modification
// | :user_deletion
// | :profile_update
// | :cluster_checks_execution_request

const LOGIN_ATTEMPT = 'login_attempt';
const RESOURCE_TAGGING = 'resource_tagging';
const RESOURCE_UNTAGGING = 'resource_untagging';
const API_KEY_GENERATION = 'api_key_generation';
const SAVING_SUMA_SETTINGS = 'saving_suma_settings';
const CHANGING_SUMA_SETTINGS = 'changing_suma_settings';
const CLEARING_SUMA_SETTINGS = 'clearing_suma_settings';
const USER_CREATION = 'user_creation';
const USER_MODIFICATION = 'user_modification';
const USER_DELETION = 'user_deletion';
const PROFILE_UPDATE = 'profile_update';
const CLUSTER_CHECKS_EXECUTION_REQUEST = 'cluster_checks_execution_request';

const taggingActivities = [RESOURCE_TAGGING, RESOURCE_UNTAGGING];

const activityTypes = [
  LOGIN_ATTEMPT,
  ...taggingActivities,
  API_KEY_GENERATION,
  SAVING_SUMA_SETTINGS,
  CHANGING_SUMA_SETTINGS,
  CLEARING_SUMA_SETTINGS,
  USER_CREATION,
  USER_MODIFICATION,
  USER_DELETION,
  PROFILE_UPDATE,
  CLUSTER_CHECKS_EXECUTION_REQUEST,
];

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

const resourceTypes = ['host', 'cluster', 'database', 'sap_system'];

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
      return 'AAA';
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
      return `Tag "${metadata.removed_tag}" removed to "${metadata.resource_id}"`;
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
      return 'AAA';
  }
};

export default function ActivityLogPage() {
  const [activityLog, setActivityLog] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getActivityLog()
      .then((response) => {
        setActivityLog(response.data);
        // setIsLoading(false);
      })
      .catch((e) => logError(e));
  }, []);

  const config = {
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
        render: (type) =>
          activityTypes.includes(type) ? activityTypesLabels[type] : 'Unknown',
      },
      {
        title: 'Resource',
        key: 'metadata',
        render: (_, activityLogEntry) => toResource(activityLogEntry),
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
    collapsibleDetailRenderer: (logEntry) => {
      return <pre>{JSON.stringify(logEntry, null, 2)}</pre>;
    },
  };

  return (
    <>
      <ActivityLogOverview />
      <Table config={config} data={activityLog} />
    </>
  );
}
