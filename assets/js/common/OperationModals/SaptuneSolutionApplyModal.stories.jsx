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

export const HanaRunning = {
  args: {
    isHanaRunning: true,
  },
};

export const AppRunning = {
  args: {
    isAppRunning: true,
  },
};

export const HanaAndAppRunning = {
  args: {
    isHanaRunning: true,
    isAppRunning: true,
  },
};
