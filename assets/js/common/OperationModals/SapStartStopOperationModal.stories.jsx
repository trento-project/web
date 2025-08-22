import { DATABASE_START, SAP_SYSTEM_START } from '@lib/operations';

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';

import { sapSystemFactory } from '@lib/test-utils/factories';

import SapStartStopOperationModal from './SapStartStopOperationModal';

export default {
  title: 'Components/SapStartStopOperationModal',
  component: SapStartStopOperationModal,
  argTypes: {
    operation: {
      description: 'Operation to request',
      control: 'text',
    },
    type: {
      description: 'System type',
      control: { type: 'radio' },
      options: [APPLICATION_TYPE, DATABASE_TYPE],
    },
    sid: {
      description: 'SAP system or database sid',
      control: 'text',
    },
    site: {
      description: 'System replication site. Only applicable for database type',
      control: 'text',
    },
    isOpen: {
      description: 'Modal is open',
      control: 'boolean',
    },
    onRequest: {
      description: 'Request start/stop operation',
    },
    onCancel: {
      description: 'Closes the modal',
    },
  },
  args: {
    isOpen: true,
  },
};

const { sid } = sapSystemFactory.build();

export const SapSystem = {
  args: {
    operation: SAP_SYSTEM_START,
    type: APPLICATION_TYPE,
    sid,
  },
};

export const Database = {
  args: {
    operation: DATABASE_START,
    type: DATABASE_TYPE,
    sid,
  },
};
