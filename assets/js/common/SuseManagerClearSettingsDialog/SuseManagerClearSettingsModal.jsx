import React from 'react';
import { noop } from 'lodash';

import {
  SUMA_PRODUCT_LABEL,
  SUMA_PRODUCT_LABEL_SHORT,
} from '@lib/model/suse_manager';

import Button from '@common/Button';
import Modal from '@common/Modal';

function SuseManagerClearSettingsModal({
  open = false,
  onClearSettings = noop,
  onCancel = noop,
}) {
  return (
    <Modal
      title={`Clear ${SUMA_PRODUCT_LABEL} Settings`}
      open={open}
      onClose={onCancel}
    >
      <div className="py-4">
        <p className="text-gray-500">
          By clearing {SUMA_PRODUCT_LABEL_SHORT} Settings you will no longer be
          able to view information relating to software packages and updates for
          hosts.
        </p>
      </div>
      <span className="flex w-1/3">
        <Button
          aria-label="confirm-clear-suma-settings"
          type="danger-bold"
          className="mr-5"
          onClick={onClearSettings}
        >
          Clear Settings
        </Button>
        <Button type="primary-white-fit" onClick={onCancel}>
          Cancel
        </Button>
      </span>
    </Modal>
  );
}

export default SuseManagerClearSettingsModal;
