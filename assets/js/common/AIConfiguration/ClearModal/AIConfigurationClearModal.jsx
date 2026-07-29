// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { noop } from 'lodash';

import Button from '@common/Button';
import Modal from '@common/Modal';

function AIConfigurationClearModal({
  open,
  onClearSettings = noop,
  onCancel = noop,
}) {
  return (
    <Modal title="Clear AI Configuration" open={open} onClose={onCancel}>
      <div className="py-4">
        <p className="text-gray-500">
          By clearing the AI Configuration, Liz will no longer be available
          until a new configuration is provided.
        </p>
      </div>
      <span className="flex w-1/3">
        <Button
          aria-label="confirm-clear-ai-settings"
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

export default AIConfigurationClearModal;
