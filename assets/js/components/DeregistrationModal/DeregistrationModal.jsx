import React from 'react';

import { EOS_CLEANING_SERVICES } from 'eos-icons-react';

import Modal from '@components/Modal';
import Button from '@components/Button';

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model';

const getContentByType = (type, data) => {
  switch (type) {
    case APPLICATION_TYPE:
      return {
        title: `Clean up absent instance ${data.instanceNumber} from ${data.sid} system`,
        body: `In the case of an ASCS instance or a unique Application Server Instance, 
          this action will cause the complete deregistration of the system.`,
      };
    case DATABASE_TYPE:
      return {
        title: `Clean up absent instance ${data.instanceNumber} from ${data.sid} database`,
        body: `In the case of the last database instance, or the last Primary instance in 
          a system replication setup, this action will cause the complete deregistration 
          of the database and the system above if any.`,
      };
    default:
      return {
        title: `Clean up data discovered by agent on host ${data.hostname}`,
        body: `This action will cause Trento to stop tracking all the components
          discovered by the agent in this host, including the host itself and any
          other component depending on it.`,
      };
  }
};

function DeregistrationModal({
  contentType = 'host',
  isOpen = false,
  onCleanUp,
  onCancel,
  ...rest
}) {
  const { title, body } = getContentByType(contentType, rest);

  return (
    <Modal title={title} open={isOpen} onClose={onCancel}>
      <div className="text-gray-500">{body}</div>
      <div className="flex justify-start gap-2 mt-4">
        <Button
          type="default-fit"
          className="inline-block mx-0.5 border-green-500 border w-fit"
          size="small"
          onClick={onCleanUp}
        >
          <EOS_CLEANING_SERVICES size="base" className="fill-white inline" />
          <span className="text-white text-sm font-bold pl-1.5">Clean up</span>
        </Button>
        <Button
          type="primary-white-fit"
          className="inline-block mx-0.5 border-green-500 border"
          size="small"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default DeregistrationModal;
