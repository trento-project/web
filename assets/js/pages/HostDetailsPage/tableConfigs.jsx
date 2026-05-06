// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { capitalize } from 'lodash';

import SapSystemLink from '@common/SapSystemLink';
import HealthIcon from '@common/HealthIcon';
import { Features } from '@pages/SapSystemDetails';

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

export const sapInstancesTableConfiguration = {
  usePadding: false,
  columns: [
    {
      title: 'Health',
      key: 'health',
      render: (content) => (
        <div className="ml-3">
          <HealthIcon health={content} />
        </div>
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
};
