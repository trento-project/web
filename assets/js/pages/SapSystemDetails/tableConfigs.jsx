import React from 'react';
import classNames from 'classnames';

import HostLink from '@common/HostLink';
import ProviderLabel from '@common/ProviderLabel';
import CleanUpButton from '@common/CleanUpButton';
import Tooltip from '@common/Tooltip';
import HealthIcon from '@common/HealthIcon';

import Features from './Features';
import InstanceStatus from './InstanceStatus';

const cellRender = (content, item) => (
  <span className={classNames({ 'text-gray-600': !!item.absent_at })}>
    {content}
  </span>
);

export const getSystemInstancesTableConfiguration = ({
  userAbilities,
  cleanUpPermittedFor,
  onCleanUpClick,
}) => ({
  usePadding: false,
  columns: [
    {
      title: 'Hostname',
      key: 'instance_hostname',
      render: (content, item) => (
        <span className="flex items-center">
          {item.absent_at && (
            <Tooltip content="Registered instance not found." place="bottom">
              <HealthIcon health="absent" />
            </Tooltip>
          )}
          <span
            className={classNames({ 'text-gray-600': item.absent_at }, 'ml-1')}
          >
            {content}
          </span>
        </span>
      ),
    },
    {
      title: 'Instance nr',
      key: 'instance_number',
      render: cellRender,
    },
    {
      title: 'Features',
      key: 'features',
      render: (content) => <Features features={content} />,
    },
    {
      title: 'Http Port',
      key: 'http_port',
      render: cellRender,
    },
    {
      title: 'Https Port',
      key: 'https_port',
      render: cellRender,
    },
    {
      title: 'Start Prio',
      key: 'start_priority',
      render: cellRender,
    },
    {
      title: 'Status',
      key: 'health',
      render: (content) => <InstanceStatus health={content} />,
    },
    {
      title: '',
      key: 'absent_at',
      className: 'w-40',
      render: (content, item) =>
        content && (
          <CleanUpButton
            size="fit"
            type="transparent"
            className="jungle-green-500 border-none shadow-none"
            cleaning={item.deregistering}
            userAbilities={userAbilities}
            permittedFor={cleanUpPermittedFor}
            onClick={() => {
              onCleanUpClick(item);
            }}
          />
        ),
    },
  ],
});

export const systemHostsTableConfiguration = {
  usePadding: false,
  columns: [
    {
      title: 'Hostname',
      key: 'hostname',
      render: (content, { id }) => <HostLink hostId={id}>{content}</HostLink>,
    },
    {
      title: 'IP',
      key: 'ip_addresses',
      render: (content) =>
        content?.map((ip) => (
          <div key={ip} className="text-sm text-gray-900">
            {ip}
          </div>
        )),
    },
    {
      title: 'Provider',
      key: 'provider',
      render: (content) => content && <ProviderLabel provider={content} />,
    },
    {
      title: 'Cluster',
      key: 'cluster',
      render: (cluster) => cluster?.name,
    },
    {
      title: 'Agent version',
      key: 'agent_version',
      render: (content) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {content}
        </span>
      ),
    },
  ],
};
