import React, { useState } from 'react';
import { capitalize, noop } from 'lodash';

import Button from '@common/Button';
import Modal from '@common/Modal';
import { InputNumber } from '@common/Input';
import Select from '@common/Select';
import Label from '@common/Label';

import { hasError, getError } from '@lib/api/validationErrors';

const defaultErrors = [];

const timeUnitOptions = ['day', 'week', 'month', 'year'];
const defaultTimeUnit = timeUnitOptions[0];

function TimeSpan({ time: initialTime, error = false, onChange = noop }) {
  const [time, setTime] = useState(initialTime);

  return (
    <div className="flex  items-center space-x-2">
      <div className="w-2/4 pb-4">
        <InputNumber
          value={time.value}
          className="!h-8"
          type="number"
          min="0"
          error={error}
          onChange={(value) => {
            const newTime = { ...time, value };
            setTime(newTime);
            onChange(newTime);
          }}
        />
      </div>
      <div className="w-2/4 ">
        <Select
          optionsName=""
          options={timeUnitOptions}
          value={time.unit || defaultTimeUnit}
          error={error}
          onChange={(unit) => {
            const newTime = { ...time, unit };
            setTime(newTime);
            onChange(newTime);
          }}
        />
      </div>
    </div>
  );
}

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
          <TimeSpan
            time={retentionTime}
            error={hasError('retentionTime', errors)}
            onChange={(time) => {
              setRetentionTime(time);
              onClearErrors();
            }}
          />
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
