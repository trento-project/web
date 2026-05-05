import {
  SAP_INSTANCE_START,
  SAP_INSTANCE_STOP,
  PACEMAKER_ENABLE,
  PACEMAKER_DISABLE,
  CLUSTER_HOST_START,
  CLUSTER_HOST_STOP,
  CLUSTER_MAINTENANCE_CHANGE,
  CLUSTER_RESOURCE_REFRESH,
} from '@lib/operations';
import { action } from 'storybook/actions';

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
        CLUSTER_HOST_START,
        CLUSTER_HOST_STOP,
        CLUSTER_MAINTENANCE_CHANGE,
        CLUSTER_RESOURCE_REFRESH,
      ],
    },
    descriptionResolverArgs: {
      description:
        'Arguments for the description resolver function to generate the operation description',
      control: { type: 'object' },
    },
    isOpen: {
      description: 'Modal is open',
      control: { type: 'boolean' },
    },
    onRequest: {
      description: 'Request saptune solution apply operation',
      action: 'onRequest',
    },
    onCancel: {
      description: 'Closes the modal',
      action: 'onCancel',
    },
  },
};

const { instance_number: instanceNumber, sid } =
  sapSystemApplicationInstanceFactory.build();

const { hostname: hostName } = hostFactory.build();

export const Default = {
  args: {
    operation: SAP_INSTANCE_START,
    descriptionResolverArgs: { instanceNumber, sid },
    isOpen: true,
    onRequest: action('onRequest'),
    onCancel: action('onCancel'),
  },
};

export const StartInstance = {
  args: {
    ...Default.args,
    operation: SAP_INSTANCE_START,
    descriptionResolverArgs: { instanceNumber, sid },
  },
};

export const StopInstance = {
  args: {
    ...Default.args,
    operation: SAP_INSTANCE_STOP,
    descriptionResolverArgs: { instanceNumber, sid },
  },
};

export const EnablePacemaker = {
  args: {
    ...Default.args,
    operation: PACEMAKER_ENABLE,
    descriptionResolverArgs: { hostName },
  },
};

export const DisablePacemaker = {
  args: {
    ...Default.args,
    operation: PACEMAKER_DISABLE,
    descriptionResolverArgs: { hostName },
  },
};

export const ClusterHostStart = {
  args: {
    ...Default.args,
    operation: CLUSTER_HOST_START,
    descriptionResolverArgs: { hostName },
  },
};

export const ClusterHostStop = {
  args: {
    ...Default.args,
    operation: CLUSTER_HOST_STOP,
    descriptionResolverArgs: { hostName },
  },
};

export const ClusterMaintenanceChange = {
  args: {
    ...Default.args,
    operation: CLUSTER_MAINTENANCE_CHANGE,
    descriptionResolverArgs: { maintenance: true },
  },
};

export const NodeMaintenanceChange = {
  args: {
    ...Default.args,
    operation: CLUSTER_MAINTENANCE_CHANGE,
    descriptionResolverArgs: { maintenance: true, node_id: hostName },
  },
};

export const ResourceMaintenanceChange = {
  args: {
    ...Default.args,
    operation: CLUSTER_MAINTENANCE_CHANGE,
    descriptionResolverArgs: {
      maintenance: true,
      resource_id: 'rsc_ip_PRD_HDB00',
    },
  },
};

export const ClusterResourcesRefresh = {
  args: {
    ...Default.args,
    operation: CLUSTER_RESOURCE_REFRESH,
    descriptionResolverArgs: {},
  },
};

export const ResourceRefresh = {
  args: {
    ...Default.args,
    operation: CLUSTER_RESOURCE_REFRESH,
    descriptionResolverArgs: {
      resource_id: 'rsc_ip_PRD_HDB00',
    },
  },
};

export const RebootHost = {
  args: {
    ...Default.args,
    operation: 'reboot',
    descriptionResolverArgs: { hostName },
  },
};
