import { saptuneOperation } from '@lib/test-utils/factories/operations';
import { action } from 'storybook/actions';

import SaptuneSolutionOperationModal from './SaptuneSolutionOperationModal';

export default {
  title: 'Components/SaptuneSolutionOperationModal',
  component: SaptuneSolutionOperationModal,
  argTypes: {
    operation: {
      description: 'Operation to request',
      control: { type: 'object' },
    },
    currentlyApplied: {
      description: 'Currently applied saptune solution',
      control: { type: 'text' },
    },
    isHanaRunning: {
      description: 'HANA instance is running on host',
      control: { type: 'boolean' },
    },
    isAppRunning: {
      description: 'Application instance is running on host',
      control: { type: 'boolean' },
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

export const Default = {
  args: {
    operation: saptuneOperation(),
    isHanaRunning: false,
    isAppRunning: false,
    isOpen: true,
    onRequest: action('onRequest'),
    onCancel: action('onCancel'),
  },
};

export const HanaRunning = {
  args: {
    operation: saptuneOperation(),
    isHanaRunning: true,
    isAppRunning: false,
    isOpen: true,
    onRequest: action('onRequest'),
    onCancel: action('onCancel'),
  },
};

export const AppRunning = {
  args: {
    operation: saptuneOperation(),
    isHanaRunning: false,
    isAppRunning: true,
    isOpen: true,
    onRequest: action('onRequest'),
    onCancel: action('onCancel'),
  },
};

export const HanaAndAppRunning = {
  args: {
    operation: saptuneOperation(),
    isHanaRunning: true,
    isAppRunning: true,
    isOpen: true,
    onRequest: action('onRequest'),
    onCancel: action('onCancel'),
  },
};

export const WithCurrentlyAppliedSolution = {
  args: {
    operation: saptuneOperation(),
    isHanaRunning: true,
    currentlyApplied: 'HANA',
    isOpen: true,
    onRequest: action('onRequest'),
    onCancel: action('onCancel'),
  },
};
