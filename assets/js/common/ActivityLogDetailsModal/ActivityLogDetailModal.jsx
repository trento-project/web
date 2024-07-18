import React from 'react';
import { noop } from 'lodash';

import Button from '@common/Button';
import Modal from '@common/Modal';
import ListView from '@common/ListView';

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

const keys = ['id', 'type', 'resource', 'user', 'message', 'time', 'metadata'];

const keyToLabel = {
  id: 'ID',
  type: 'Activity Type',
  resource: 'Resource',
  user: 'User',
  time: 'Created at',
  message: 'Message',
  metadata: 'Data',
};

const toResource = (activityLogEntry) => {
  const { metadata, type } = activityLogEntry;
  switch (type) {
    case LOGIN_ATTEMPT:
      return 'Application';
    case RESOURCE_TAGGING:
    case RESOURCE_UNTAGGING:
      return (
        resourceTypesLabels[metadata.resource_type] ??
        'Unable to determine resource type'
      );
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

const renderMetadata = (metadata) => (
  <pre>{JSON.stringify(metadata, null, 2)}</pre>
);

const renderType = (type) => activityTypesLabels[type] ?? type;

const renderResource = (entry) => (
  <span aria-label="activity-log-resource">{toResource(entry)}</span>
);

const keyRenderers = {
  metadata: renderMetadata,
  type: renderType,
  resource: renderResource,
};

function ActivityLogDetailModal({ open = false, entry, onClose = noop }) {
  const data = keys.map((key) => ({
    title: keyToLabel[key] || key,
    content: key === 'resource' ? entry : entry[key],
    render: keyRenderers[key] || undefined,
    className: 'col-span-5',
  }));

  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title="Activity Details"
      open={open}
      onClose={onClose}
    >
      <ListView
        titleClassName="col-span-2"
        className="text-sm"
        orientation="horizontal"
        data={data}
      />
      <div className="flex flex-row w-1/6 space-x-2">
        <Button type="primary-white" className="w-1/2" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

export default ActivityLogDetailModal;
