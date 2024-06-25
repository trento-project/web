import React, { useState } from 'react';
import { capitalize, noop } from 'lodash';

import Button from '@common/Button';
import Modal from '@common/Modal';
import { InputNumber } from '@common/Input';
import Select from '@common/Select';
import Label from '@common/Label';

import { hasError, getError } from '@lib/input/errors';

const defaultErrors = [];

const timeUnitOptions = ['days', 'weeks', 'months', 'years'];
const defaultTimeUnit = timeUnitOptions[0];

/**
 * Modal to edit Activity Logs settings
 */
function ActivityLogsSettingsModal({
  open = false,
  loading = false,
  initialRetentionTime,
  errors = defaultErrors,
  onSave = noop,
  onCancel = noop,
  onClearErrors = noop,
}) {
  const [retentionTime, setRetentionTime] = useState(initialRetentionTime);

  return (
    <Modal title="Enter Activity Logs Settings" open={open} onClose={onCancel}>
      <div className="grid grid-cols-6 my-5 gap-6">
        <Label className="col-span-2" required>
          Retention Time
        </Label>
        <div className="col-span-4">
          <div className="flex  items-center my-1 space-x-2">
            <div className="w-2/4 pt-1">
              <InputNumber
                value={retentionTime.value}
                className="!h-8"
                type="number"
                min="0"
                error={hasError('retentionTime', errors)}
                onChange={(value) => {
                  setRetentionTime({ ...retentionTime, value });
                  onClearErrors();
                }}
              />
            </div>
            <div className="w-2/4 pt-4">
              <Select
                optionsName=""
                options={timeUnitOptions}
                value={retentionTime.unit || defaultTimeUnit}
                error={hasError('retentionTime', errors)}
                onChange={(value) => {
                  setRetentionTime({ ...retentionTime, unit: value });
                  onClearErrors();
                }}
              />
            </div>
          </div>
          {hasError('retentionTime', errors) && (
            <p
              aria-label="retention-time-input-error"
              className="text-red-500 mt-1"
            >
              {capitalize(getError('retentionTime', errors))}
            </p>
          )}
        </div>

        <p className="col-span-6">
          <span className="text-red-500">*</span> Required Fields
        </p>
      </div>
      <div className="flex flex-row w-80 space-x-2">
        <Button
          disabled={loading}
          onClick={() => {
            const payload = {
              retentionTime,
            };
            onSave(payload);
          }}
        >
          Save Settings
        </Button>
        <Button type="primary-white" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default ActivityLogsSettingsModal;
