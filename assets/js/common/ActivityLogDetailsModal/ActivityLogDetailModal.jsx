import React from 'react';
import { get, noop } from 'lodash';
import { NavLink } from 'react-router';

import Markdown from '@common/Markdown';
import Button from '@common/Button';
import Modal from '@common/Modal';
import ListView from '@common/ListView';

import { toResource, toLabel } from '@lib/model/activityLog';
import classNames from 'classnames';

const keys = [
  'id',
  'correlatedEvents',
  'type',
  'resource',
  'user',
  'severity',
  'message',
  'time',
  'metadata',
];

const keyToLabel = {
  id: 'ID',
  correlatedEvents: 'Related Events',
  type: 'Activity Type',
  resource: 'Resource',
  user: 'User',
  severity: 'Severity',
  time: 'Created at',
  message: 'Message',
  metadata: 'Data',
};

const renderMetadata = (metadata) => (
  <Markdown className="text-sm">
    {`\`\`\`json\n${JSON.stringify(metadata, null, 2)}\n\`\`\``}
  </Markdown>
);

const renderType = (type) => toLabel({ type });

const renderResource = (entry) => (
  <span aria-label="activity-log-resource">{toResource(entry)}</span>
);

function RenderCorrelatedEventsLink({ onClose, entry }) {
  return (
    <NavLink
      to={`/activity_log?severity=info&severity=warning&severity=critical&search=${entry.metadata.correlation_id}&first=20`}
      onClick={onClose}
      className="text-jungle-green-500"
    >
      Show Events
    </NavLink>
  );
}

const keyRenderers = {
  metadata: renderMetadata,
  type: renderType,
  resource: renderResource,
  correlatedEvents: RenderCorrelatedEventsLink,
};

function ActivityLogDetailModal({ open = false, entry, onClose = noop }) {
  const maybeCorrelationId = get(entry, 'metadata.correlation_id');
  const filteredKeys = maybeCorrelationId
    ? keys
    : keys.filter((key) => key !== 'correlatedEvents');
  const resolveArgs = (key) => {
    switch (key) {
      case 'resource':
        return entry;

      case 'correlatedEvents':
        return { entry, onClose };

      default:
        return entry[key];
    }
  };
  const data = filteredKeys.map((key) => ({
    title: keyToLabel[key] || key,
    content: resolveArgs(key),
    render: keyRenderers[key],
    className: classNames('col-span-5', {
      'text-gray-500': key !== 'metadata',
    }),
  }));

  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title="Activity Details"
      open={open}
      onClose={onClose}
    >
      <ListView
        titleClassName="col-span-2 text-gray-500"
        className="text-sm"
        orientation="horizontal"
        data={data}
      />
      <div className="flex flex-row w-24 space-x-2 mt-3">
        <Button type="primary-white" className="w-1/2" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

export default ActivityLogDetailModal;
