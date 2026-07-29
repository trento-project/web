// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { capitalize } from 'lodash';
import classNames from 'classnames';

import { STALE_ROW } from '@lib/tables';
import SapSystemLink from '@common/SapSystemLink';
import { Features, InstanceStatus } from '@pages/SapSystemDetails';

import { getInstanceID } from '@state/instances';

export const subscriptionsTableConfiguration = {
  usePadding: false,
  columns: [
    {
      title: 'Identifier',
      key: 'identifier',
    },
    {
      title: 'Arch',
      key: 'arch',
    },
    {
      title: 'version',
      key: 'version',
    },

    {
      title: 'type',
      key: 'type',
    },
    {
      title: 'Status',
      key: 'status',
    },
    {
      title: 'Subscription status',
      key: 'subscription_status',
    },
    {
      title: 'starts at',
      key: 'starts_at',
    },
    {
      title: 'Expires at',
      key: 'expires_at',
    },
  ],
};

export const getSapInstancesTableConfiguration = ({ userTimezone }) => ({
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
      title: 'SID',
      key: 'sid',
      render: (_content, item) => (
        <SapSystemLink
          systemType={item?.type}
          sapSystemId={getInstanceID(item)}
        >
          {item?.sid}
        </SapSystemLink>
      ),
    },
    { title: 'Type', key: 'type', render: capitalize },
    {
      title: 'Features',
      key: 'features',
      render: (content) => <Features features={content} />,
    },
    { title: 'Instance Number', key: 'instance_number' },
  ],
});
