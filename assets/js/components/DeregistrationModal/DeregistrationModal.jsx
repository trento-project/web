import React from 'react';

import { EOS_CLEANING_SERVICES } from 'eos-icons-react';

import Modal from '@components/Modal';
import Button from '@components/Button';

function DeregistrationModal({
  hostname,
  isOpen = false,
  onCleanUp,
  onCancel,
}) {
  return (
    <Modal
      title={`Clean up data discovered by agent on host ${hostname}`}
      open={isOpen}
      onClose={onCancel}
    >
      <div className="text-gray-500">
        This action will cause Trento to stop tracking all the components
        discovered by the agent in this host, including the host itself and any
        other component depending on it.
      </div>
      <div className="flex justify-start gap-2 mt-4">
        <Button
          data-testid="cleanup-confirm"
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
