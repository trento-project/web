import React from 'react';
import { Link } from 'react-router-dom';
import { Features, InstanceStatus } from './GenericSystemDetails';

export const systemInstancesTableConfiguration = {
  usePadding: false,
  columns: [
    { title: 'Hostname', key: 'instanceHostname' },
    { title: 'Instance Number', key: 'instanceNumber' },
    {
      title: 'Features',
      key: 'features',
      render: (content) => {
        return <Features features={content} />;
      },
    },
    { title: 'Http Port', key: 'httpPort' },
    { title: 'Https Port', key: 'httpsPort' },
    { title: 'Start Priority', key: 'startPriority' },
    {
      title: 'Status',
      key: 'health',
      render: (content) => {
        return <InstanceStatus health={content} />;
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
      render: (content, { id }) => (
        <span className="transition hover:text-green-600">
          <Link to={`/hosts/${id}`}>{content}</Link>
        </span>
      ),
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
    },
    {
      title: 'Cluster',
      key: 'cluster',
      render: (cluster) => {
        return cluster?.name;
      },
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
