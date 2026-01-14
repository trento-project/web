import { saptuneOperation } from '@lib/test-utils/factories/operations';

import SaptuneSolutionOperationModal from './SaptuneSolutionOperationModal';

export default {
  title: 'Components/SaptuneSolutionOperationModal',
  component: SaptuneSolutionOperationModal,
  argTypes: {
    operation: {
      description: 'Operation to request',
      control: 'text',
    },
    currentlyApplied: {
      description: 'Currently applied saptune solution',
      control: 'text',
    },
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
    operation: saptuneOperation(),
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

export const WithCurrentlyAppliedsolution = {
  args: {
    isHanaRunning: true,
    currentlyApplied: 'HANA',
  },
};
