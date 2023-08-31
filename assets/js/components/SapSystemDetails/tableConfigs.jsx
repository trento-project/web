import React from 'react';
import classNames from 'classnames';

import HostLink from '@components/HostLink';
import ProviderLabel from '@components/ProviderLabel';
import CleanUpButton from '@components/CleanUpButton';
import Tooltip from '@components/Tooltip';
import HealthIcon from '@components/Health';

import Features from './Features';
import InstanceStatus from './InstanceStatus';

export const systemInstancesTableConfiguration = {
  usePadding: false,
  rowClassName: 'bg-jungle-green',
  columns: [
    {
      title: 'Hostname',
      key: 'instance_hostname',
      render: (content, item) => {
        if (item.absent_at) {
          return (
            <Tooltip
              content="Registered instance not found."
              place="bottom"
              isEnabled={!!item.absent_at}
            >
              <HealthIcon health="absent" />
              <span className="mx-1 text-gray-600">{content}</span>
            </Tooltip>
          );
        }
        return <span>{content}</span>;
      },
    },
    {
      title: 'Instance nr',
      key: 'instance_number',
      render: (content, item) => (
        <span className={classNames({ 'text-gray-600': !!item.absent_at })}>
          {content}
        </span>
      ),
    },
    {
      title: 'Features',
      key: 'features',
      render: (content) => <Features features={content} />,
    },
    {
      title: 'Http Port',
      key: 'http_port',
      render: (content, item) => (
        <span className={classNames({ 'text-gray-600': !!item.absent_at })}>
          {content}
        </span>
      ),
    },
    {
      title: 'Https Port',
      key: 'https_port',
      render: (content, item) => (
        <span className={classNames({ 'text-gray-600': !!item.absent_at })}>
          {content}
        </span>
      ),
    },
    {
      title: 'Start Prio',
      key: 'start_priority',
      render: (content, item) => (
        <span className={classNames({ 'text-gray-600': !!item.absent_at })}>
          {content}
        </span>
      ),
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
      render: (content, _item) => {
        if (content) {
          return (
            <CleanUpButton
              size="fit"
              type="transparent"
              className="jungle-green-500 border-none shadow-none"
            />
          );
        }
        return null;
      },
    },
  ],
};

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
