import { SAP_INSTANCE_START, SAP_INSTANCE_STOP } from '@lib/operations';

import SapInstanceStartStopModal from './SapInstanceStartStopModal';

export default {
  title: 'Components/SapInstanceStartStopModal',
  component: SapInstanceStartStopModal,
  argTypes: {
    operation: {
      description: 'Start/Stop operation name',
      control: { type: 'radio' },
      options: [SAP_INSTANCE_START, SAP_INSTANCE_STOP],
    },
    instanceNumber: {
      description: 'Instance number',
      control: 'text',
    },
    sid: {
      description: 'SAP system sid',
      control: 'text',
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
    instanceNumber: '00',
    sid: 'PRD',
    isOpen: true,
  },
};

export const StartInstance = {
  args: {
    operation: SAP_INSTANCE_START,
  },
};

export const StopInstance = {
  args: {
    operation: SAP_INSTANCE_STOP,
  },
};
