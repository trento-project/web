import React, { useState } from 'react';
import { capitalize, noop } from 'lodash';

import Button from '@common/Button';
import Modal from '@common/Modal';
import { InputNumber } from '@common/Input';
import Select from '@common/Select';
import Label from '@common/Label';

import { getError } from '@lib/api/validationErrors';

const defaultErrors = [];

const timeUnitOptions = ['day', 'week', 'month', 'year'];
const defaultTimeUnit = timeUnitOptions[0];

const toRetentionTimeErrorMessage = (errors) =>
  [
    capitalize(getError('retention_time/value', errors)),
    capitalize(getError('retention_time/unit', errors)),
  ]
    .filter(Boolean)
    .join('; ');

const toGenericErrorMessage = (errors) =>
  // the first error of type string is considered the generic error
  errors.find((error) => typeof error === 'string');

function TimeSpan({ time: initialTime, error = false, onChange = noop }) {
  const [time, setTime] = useState(initialTime);

  return (
    <div className="flex  items-center space-x-2">
      <div className="w-2/4 pt-1">
        <InputNumber
          value={time.value}
          className="!h-8"
          type="number"
          min="1"
          error={error}
          onChange={(value) => {
            const newTime = { ...time, value };
            setTime(newTime);
            onChange(newTime);
          }}
        />
      </div>
      <div className="w-2/4">
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
 * Display an error message. If no error is provided, an empty space is displayed to keep the layout stable
 * @param {string} text The error message to display
 * @returns {JSX.Element}
 */
function Error({ text }) {
  return text ? (
    <p className="text-red-500 mt-1">{text}</p>
  ) : (
    <p className="mt-1">&nbsp;</p>
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

  const retentionTimeError = toRetentionTimeErrorMessage(errors);
  const genericError = toGenericErrorMessage(errors);

  return (
    <Modal title="Enter Activity Logs Settings" open={open} onClose={onCancel}>
      <div className="grid grid-cols-6 my-5 gap-6">
        <Label className="col-span-2" required>
          Retention Time
        </Label>
        <div className="col-span-4">
          <TimeSpan
            time={retentionTime}
            error={Boolean(retentionTimeError)}
            onChange={(time) => {
              setRetentionTime(time);
              onClearErrors();
            }}
          />
          <Error text={retentionTimeError} />
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
              retention_time: retentionTime,
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
      <div className="flex flex-row w-80 space-x-2">
        <Error text={genericError} />
      </div>
    </Modal>
  );
}

export default ActivityLogsSettingsModal;
