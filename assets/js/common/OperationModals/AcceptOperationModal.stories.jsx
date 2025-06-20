import {
  SAP_INSTANCE_START,
  SAP_INSTANCE_STOP,
  PACEMAKER_ENABLE,
  PACEMAKER_DISABLE,
} from '@lib/operations';

import {
  hostFactory,
  sapSystemApplicationInstanceFactory,
} from '@lib/test-utils/factories';

import AcceptOperationModal from './AcceptOperationModal';

export default {
  title: 'Components/AcceptOperationModal',
  component: AcceptOperationModal,
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
      control: 'array',
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
    descriptionResolverArgs: [instanceNumber, sid],
  },
};

export const StopInstance = {
  args: {
    operation: SAP_INSTANCE_STOP,
    descriptionResolverArgs: [instanceNumber, sid],
  },
};

export const EnablePacemaker = {
  args: {
    operation: PACEMAKER_ENABLE,
    descriptionResolverArgs: [hostName],
  },
};

export const DisablePacemaker = {
  args: {
    operation: PACEMAKER_DISABLE,
    descriptionResolverArgs: [hostName],
  },
};
