import React from 'react';
import { Features } from '@components/SapSystemDetails';

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
      title: 'starts_at',
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
    { title: 'ID', key: 'sap_system_id' },
    { title: 'SID', key: 'sid' },
    { title: 'Type', key: 'type' },
    {
      title: 'Features',
      key: 'features',
      render: (content) => {
        return <Features features={content} />;
      },
    },
    { title: 'Instance Number', key: 'instance_number' },
  ],
};
