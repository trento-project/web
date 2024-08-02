import React from 'react';
import { noop } from 'lodash';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Button from '@common/Button';
import Modal from '@common/Modal';
import ListView from '@common/ListView';

import { toResource, toLabel } from '@lib/model/activityLog';
import classNames from 'classnames';

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

const renderMetadata = (metadata) => (
  <ReactMarkdown className="markdown text-sm" remarkPlugins={[remarkGfm]}>
    {`\`\`\`json\n${JSON.stringify(metadata, null, 2)}\n\`\`\``}
  </ReactMarkdown>
);

const renderType = (type) => toLabel({ type });

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
