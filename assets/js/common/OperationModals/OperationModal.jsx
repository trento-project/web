import React, { useState } from 'react';
import { noop, isNull } from 'lodash';

import {
  getDescriptionResolver,
  getOperationTitle,
  getOperationText,
} from '@lib/operations';

import Modal from '@common/Modal';
import Button from '@common/Button';
import CheckableWarningMessage from '@common/CheckableWarningMessage';

function OperationModal({
  operation,
  descriptionResolverArgs = [],
  applyDisabled = true,
  checked: controlledCheck = null,
  onChecked: controlledOnChecked = null,
  isOpen = false,
  onRequest = noop,
  onCancel = noop,
  children,
}) {
  const [unControlledChecked, setUncontrolledChecked] = useState(false);

  const [checked, onChecked] =
    isNull(controlledCheck) && isNull(controlledOnChecked)
      ? [unControlledChecked, () => setUncontrolledChecked((prev) => !prev)]
      : [controlledCheck, controlledOnChecked];

  const operationTitle = getOperationTitle(operation);

  const descriptionResolver = getDescriptionResolver(operation);

  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title={operationTitle}
      open={isOpen}
      onClose={onCancel}
    >
      <p className="text-gray-500 text-sm font-normal tracking-wide pb-3">
        {descriptionResolver(operation, ...descriptionResolverArgs)}
      </p>
      <CheckableWarningMessage checked={checked} onChecked={onChecked}>
        Trento & SUSE cannot be held liable for damages if system is unable to
        function due applying {getOperationText(operation)}
      </CheckableWarningMessage>
      {children}
      <div className="flex justify-start gap-2 mt-4">
        <Button
          type="default-fit"
          className="inline-block mx-0.5 border-green-500 border w-fit"
          size="small"
          disabled={applyDisabled}
          onClick={() => {
            onRequest();
            onChecked();
          }}
        >
          Apply
        </Button>
        <Button
          type="primary-white-fit"
          className="inline-block mx-0.5 border-green-500 border"
          size="small"
          onClick={() => {
            onCancel();
            onChecked();
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default OperationModal;
