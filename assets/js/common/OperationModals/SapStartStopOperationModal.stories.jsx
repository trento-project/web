import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';
import { DATABASE_START, SAP_SYSTEM_START } from '@lib/operations';
import { sapSystemFactory } from '@lib/test-utils/factories';
import { action } from 'storybook/actions';

import SapStartStopOperationModal from './SapStartStopOperationModal';

export default {
  title: 'Components/SapStartStopOperationModal',
  component: SapStartStopOperationModal,
  argTypes: {
    operation: {
      description: 'Operation to request',
      control: { type: 'object' },
    },
    type: {
      description: 'System type',
      control: { type: 'radio' },
      options: [APPLICATION_TYPE, DATABASE_TYPE],
    },
    sid: {
      description: 'SAP system or database sid',
      control: { type: 'text' },
    },
    site: {
      description: 'System replication site. Only applicable for database type',
      control: { type: 'text' },
    },
    isOpen: {
      description: 'Modal is open',
      control: { type: 'boolean' },
    },
    onRequest: {
      description: 'Request start/stop operation',
      action: 'onRequest',
    },
    onCancel: {
      description: 'Closes the modal',
      action: 'onCancel',
    },
  },
};

const { sid } = sapSystemFactory.build();

export const Default = {
  args: {
    operation: SAP_SYSTEM_START,
    type: APPLICATION_TYPE,
    sid,
    isOpen: true,
    onRequest: action('onRequest'),
    onCancel: action('onCancel'),
  },
};

export const SapSystem = {
  args: {
    ...Default.args,
    operation: SAP_SYSTEM_START,
    type: APPLICATION_TYPE,
    sid,
    isOpen: true,
    onRequest: action('onRequest'),
    onCancel: action('onCancel'),
  },
};

export const Database = {
  args: {
    ...Default.args,
    operation: DATABASE_START,
    type: DATABASE_TYPE,
    sid,
    isOpen: true,
    onRequest: action('onRequest'),
    onCancel: action('onCancel'),
  },
};
