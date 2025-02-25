import React from 'react';
import { noop } from 'lodash';

import Modal from '@common/Modal';
import Button from '@common/Button';
import Banner from '@common/Banners/Banner';

function OperationForbiddenModal({
  operation,
  errors,
  isOpen = false,
  onCancel = noop,
  children,
}) {
  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title="Operation Forbidden"
      open={isOpen}
      onClose={onCancel}
    >
      <Banner type="error">
        Unable to run {operation} operation. Some of the conditions are not met.
      </Banner>
      <p className="text-sm mb-1">Some of the next conditions are not met:</p>
      <ul className="list-disc list-inside space-y-1 mb-1">
        {errors.map((error) => (
          <li key={error} className="text-sm">
            {error}
          </li>
        ))}
      </ul>
      <p className="text-sm mb-1">{children}</p>
      <div className="flex justify-start gap-2 mt-4">
        <Button
          type="primary-white-fit"
          className="inline-block mx-0.5 border-green-500 border"
          size="small"
          onClick={onCancel}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}

export default OperationForbiddenModal;
