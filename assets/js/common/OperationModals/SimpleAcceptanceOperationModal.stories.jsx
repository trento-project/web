import {
  SAP_INSTANCE_START,
  SAP_INSTANCE_STOP,
  PACEMAKER_ENABLE,
  PACEMAKER_DISABLE,
  CLUSTER_MAINTENANCE_CHANGE,
} from '@lib/operations';

import {
  hostFactory,
  sapSystemApplicationInstanceFactory,
} from '@lib/test-utils/factories';

import SimpleAcceptanceOperationModal from './SimpleAcceptanceOperationModal';

export default {
  title: 'Components/SimpleAcceptanceOperationModal',
  component: SimpleAcceptanceOperationModal,
  argTypes: {
    operation: {
      description: 'Operation to apply that requires confirmation',
      control: { type: 'radio' },
      options: [
        SAP_INSTANCE_START,
        SAP_INSTANCE_STOP,
        PACEMAKER_ENABLE,
        PACEMAKER_DISABLE,
      ],
    },
    descriptionResolverArgs: {
      description:
        'Arguments for the description resolver function to generate the operation description',
      control: 'object',
    },
    isOpen: {
      description: 'Modal is open',
      control: 'boolean',
    },
    onRequest: {
      description: 'Request saptune solution apply operation',
    },
    onCancel: {
      description: 'Closes the modal',
    },
  },
  args: {
    isOpen: true,
  },
};

const { instance_number: instanceNumber, sid } =
  sapSystemApplicationInstanceFactory.build();

const { hostname: hostName } = hostFactory.build();

export const StartInstance = {
  args: {
    operation: SAP_INSTANCE_START,
    descriptionResolverArgs: { instanceNumber, sid },
  },
};

export const StopInstance = {
  args: {
    operation: SAP_INSTANCE_STOP,
    descriptionResolverArgs: { instanceNumber, sid },
  },
};

export const EnablePacemaker = {
  args: {
    operation: PACEMAKER_ENABLE,
    descriptionResolverArgs: { hostName },
  },
};

export const DisablePacemaker = {
  args: {
    operation: PACEMAKER_DISABLE,
    descriptionResolverArgs: { hostName },
  },
};

export const ClusterMaintenanceChange = {
  args: {
    operation: CLUSTER_MAINTENANCE_CHANGE,
    descriptionResolverArgs: { maintenance: true },
  },
};

export const NodeMaintenanceChange = {
  args: {
    operation: CLUSTER_MAINTENANCE_CHANGE,
    descriptionResolverArgs: { maintenance: true, node_id: hostName },
  },
};

export const ResourceMaintenanceChange = {
  args: {
    operation: CLUSTER_MAINTENANCE_CHANGE,
    descriptionResolverArgs: {
      maintenance: true,
      resource_id: 'rsc_ip_PRD_HDB00',
    },
  },
};
