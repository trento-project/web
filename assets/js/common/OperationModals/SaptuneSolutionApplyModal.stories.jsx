import React from 'react';

import SaptuneSolutionApplyModal from './SaptuneSolutionApplyModal';

export default {
  title: 'Components/SaptuneSolutionApplyModal',
  component: SaptuneSolutionApplyModal,
  argTypes: {
    isHanaRunning: {
      description: 'HANA instance is running on host',
      control: 'boolean',
    },
    isAppRunning: {
      description: 'Application instance is running on host',
      control: 'boolean',
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
    isHanaRunning: false,
    isAppRunning: false,
    isOpen: true,
  },
};

export function HanaRunning(args) {
  return <SaptuneSolutionApplyModal {...args} isHanaRunning />;
}

export function AppRunning(args) {
  return <SaptuneSolutionApplyModal {...args} isAppRunning />;
}

export function HanaAndAppRunning(args) {
  return <SaptuneSolutionApplyModal {...args} isHanaRunning isAppRunning />;
}
