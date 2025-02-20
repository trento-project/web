import React from 'react';
import { EOS_WARNING_OUTLINED } from 'eos-icons-react';
import { noop } from 'lodash';

import Modal from '@common/Modal';
import Button from '@common/Button';
import Input from '@common/Input';

function OperationModal({
  title,
  description,
  operationText,
  applyDisabled = true,
  checked = false,
  isOpen = false,
  onChecked = noop,
  onRequest = noop,
  onCancel = noop,
  children,
}) {
  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title={title}
      open={isOpen}
      onClose={onCancel}
    >
      <p className="text-gray-500 text-sm font-normal tracking-wide pb-3">
        {description}
      </p>
      <div className="flex items-center text-sm font-normal border border-yellow-400 bg-yellow-50 p-4 rounded-md text-yellow-600 mb-4">
        <Input
          type="checkbox"
          checked={checked}
          className="border-yellow-400"
          onChange={onChecked}
        />

        <EOS_WARNING_OUTLINED
          size="l"
          className="centered fill-yellow-500 ml-4 mr-4"
        />
        <span className="font-semibold">
          Trento & SUSE cannot be held liable for damages if system is unable to
          function due applying {operationText}.
        </span>
      </div>
      {children}
      <div className="flex justify-start gap-2 mt-4">
        <Button
          type="default-fit"
          className="inline-block mx-0.5 border-green-500 border w-fit"
          size="small"
          disabled={applyDisabled}
          onClick={onRequest}
        >
          Apply
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

export default OperationModal;
