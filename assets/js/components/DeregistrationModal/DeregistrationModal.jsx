import React from 'react';

import { EOS_CLEANING_SERVICES } from 'eos-icons-react';

import Modal from '@components/Modal';
import Button from '@components/Button';

function DeregistrationModal({
  hostName,
  isOpen = false,
  onCleanUp,
  onCancel,
}) {
  return (
    <Modal
      title={`Clean up data discovered by agent on host ${hostName}`}
      open={isOpen}
      onClose={onCancel}
    >
      <div className="text-gray-500">
        This will ignore all the past events collected by the agent instance
        until this point. This the action is not reversible.
      </div>
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
