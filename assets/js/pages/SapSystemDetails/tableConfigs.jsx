// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import classNames from 'classnames';
import { isEmpty } from 'lodash';

import { OPERATION_NOT_ALLOWED_HOST } from '@lib/operations';
import { STALE_ROW } from '@lib/tables';
import { isHeartbeatPassing } from '@lib/model/hosts';

import HostLink from '@common/HostLink';
import ProviderLabel from '@common/ProviderLabel';
import CleanUpButton from '@common/CleanUpButton';
import OperationsButton from '@common/OperationsButton';

import ClusterLink from '@pages/ClusterDetails/ClusterLink';

import Features from './Features';
import InstanceStatus from './InstanceStatus';

export const getSystemInstancesTableConfiguration = ({
  userAbilities,
  userTimezone,
  cleanUpPermittedFor,
  onCleanUpClick,
  operationsEnabled = false,
  getOperations = () => [],
}) => ({
  usePadding: false,
  rowClassName: ({ stale_at, absent_at }) =>
    classNames({
      [STALE_ROW]: !!stale_at,
      'text-gray-600': !!absent_at,
    }),
  columns: [
    {
      title: 'Status',
      key: 'status',
      className: 'w-10',
      render: (content, item) => (
        <InstanceStatus
          status={content}
          absent={!!item.absent_at}
          staleAt={item.stale_at}
          timezone={userTimezone}
        />
      ),
    },
    {
      title: 'Hostname',
      key: 'instance_hostname',
    },
    {
      title: 'Instance nr',
      key: 'instance_number',
    },
    {
      title: 'Features',
      key: 'features',
      render: (content) => <Features features={content} />,
    },
    {
      title: 'Http Port',
      key: 'http_port',
    },
    {
      title: 'Https Port',
      key: 'https_port',
    },
    {
      title: 'Start Prio',
      key: 'start_priority',
    },
    {
      title: '',
      key: 'actions',
      className: 'w-32',
      render: (_content, item) => {
        if (item.absent_at) {
          return (
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
          );
        }

        const operations = getOperations(item);
        if (operationsEnabled && !isEmpty(operations)) {
          return (
            <div className="flex items-center justify-end">
              <OperationsButton
                text=""
                userAbilities={userAbilities}
                menuPosition="bottom end"
                transparent
                disabled={!isHeartbeatPassing(item.host)}
                disabledTooltip={OPERATION_NOT_ALLOWED_HOST}
                operations={operations}
              />
            </div>
          );
        }

        return null;
      },
    },
  ],
});

export const systemHostsTableConfiguration = {
  usePadding: false,
  rowClassName: ({ heartbeat }) =>
    classNames({ [STALE_ROW]: heartbeat !== 'passing' }),
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
          <div key={ip} className="text-sm">
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
      render: (cluster) => <ClusterLink cluster={cluster} />,
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
