import React from 'react';

import { clusterFactory } from '@lib/test-utils/factories';

import ClusterMaintenanceChangeModal from './ClusterMaintenanceChangeModal';

const { details: clusterDetails } = clusterFactory.build();
const { details: clusterMaintenanceDetails } = clusterFactory.build({
  details: { maintenance_mode: true },
});

export default {
  title: 'Components/ClusterMaintenanceChangeModal',
  component: ClusterMaintenanceChangeModal,
  argTypes: {
    clusterDetails: {
      description: 'Cluster details',
      control: 'object',
    },
    isOpen: {
      description: 'Modal is open',
      control: 'boolean',
    },
    onRequest: {
      description: 'Request cluster maintenance change operation',
    },
    onCancel: {
      description: 'Closes the modal',
    },
  },
  args: {
    clusterDetails,
    isOpen: true,
  },
};

export function Default(args) {
  return <ClusterMaintenanceChangeModal {...args} />;
}

export function ClusterMaintenance(args) {
  return (
    <ClusterMaintenanceChangeModal
      {...args}
      clusterDetails={clusterMaintenanceDetails}
    />
  );
}
