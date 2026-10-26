// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState } from 'react';
import { noop } from 'lodash';

import Button from '@common/Button';
import ChecksFrequencyInput from '@common/ChecksFrequencyInput';
import Label from '@common/Label';
import Modal from '@common/Modal';

/**
 * Modal to edit the global checks execution frequency
 */
function ChecksExecutionSettingsModal({
  open = false,
  loading = false,
  initialInterval,
  onSave = noop,
  onCancel = noop,
}) {
  const [interval, setInterval] = useState(initialInterval);

  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title="Check Executions Settings"
      open={open}
      onClose={onCancel}
    >
      <div className="text-gray-500">
        Configure when the health checks are run.
      </div>
      <div className="grid grid-cols-6 my-5 gap-6 items-center">
        <Label className="col-span-2">Frequency</Label>
        <div className="col-span-4">
          <ChecksFrequencyInput value={interval} onChange={setInterval} />
        </div>
      </div>
      <div className="flex flex-row w-80 space-x-2">
        <Button disabled={loading} onClick={() => onSave({ interval })}>
          Save Settings
        </Button>
        <Button type="primary-white" onClick={onCancel}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

export default ChecksExecutionSettingsModal;
