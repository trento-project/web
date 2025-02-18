import React from 'react';
import { noop } from 'lodash';

import Modal from '@common/Modal';
import Button from '@common/Button';

function ResetCheckCustomizationModal({
  checkId,
  open = false,
  onReset = noop,
  onCancel = noop,
}) {
  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title={`Reset check: ${checkId}`}
      open={open}
      onClose={onCancel}
    >
      <div className="text-gray-500">
        You are about to reset custom checks values. Would you like to continue?
      </div>
      <div className="flex justify-start gap-2 mt-4">
        <Button
          type="default-fit"
          className="inline-block mx-0.5 border-green-500 border w-fit"
          size="small"
          onClick={onReset}
        >
          Reset
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

export default ResetCheckCustomizationModal;
