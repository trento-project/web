// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React, { useState } from 'react';
import { noop, upperFirst } from 'lodash';

import Button from '@common/Button';
import Modal from '@common/Modal';
import Select from '@common/Select';
import Label from '@common/Label';
import Switch from '@common/Switch';

import { getError, getGlobalError } from '@lib/api/validationErrors';
import { CHECKS_FREQUENCY_UNITS } from '@lib/model/checksFrequency';

const defaultErrors = [];

const unitOptions = [
  { value: 'minute', label: 'Minutes' },
  { value: 'hour', label: 'Hours' },
  { value: 'week', label: 'Weeks' },
];

const toValueOption = (value) => ({ value, label: `${value}` });

const toFrequencyErrorMessage = (errors) =>
  [
    upperFirst(getError('frequency', errors)),
    upperFirst(getError('frequency/value', errors)),
    upperFirst(getError('frequency/unit', errors)),
  ]
    .filter(Boolean)
    .join('; ');

const toGlobalErrorMessage = (errors) => upperFirst(getGlobalError(errors));

/**
 * Value and unit selects
 */
function FrequencySpan({
  frequency,
  disabled = false,
  error = false,
  onChange = noop,
}) {
  const unit = frequency?.unit;

  return (
    <div className="flex items-center space-x-2">
      <div className="w-1/4">
        <Select
          aria-label="checks-frequency-value"
          options={(CHECKS_FREQUENCY_UNITS[unit] ?? []).map(toValueOption)}
          value={frequency && toValueOption(frequency.value)}
          isDisabled={disabled}
          error={error}
          onChange={(value) => onChange({ ...frequency, value })}
        />
      </div>
      <div className="flex w-1/4">
        <Select
          className="min-w-32 max-w-fit"
          aria-label="checks-frequency-unit"
          options={unitOptions}
          value={unitOptions.find((option) => option.value === unit)}
          isDisabled={disabled}
          error={error}
          onChange={(newUnit) => {
            if (newUnit !== unit) {
              onChange({
                value: CHECKS_FREQUENCY_UNITS[newUnit][0],
                unit: newUnit,
              });
            }
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
    <p className="text-red-500 mt-1" role="alert">
      {text}
    </p>
  ) : (
    <p className="mt-1">&nbsp;</p>
  );
}

/**
 * Modal to edit the global checks frequency settings. Switching the periodic
 * checks off keeps the frequency, which is saved as well
 */
function ChecksFrequencySettingsModal({
  open = false,
  loading = false,
  initialEnabled = true,
  initialFrequency,
  errors = defaultErrors,
  onSave = noop,
  onCancel = noop,
  onClearErrors = noop,
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [frequency, setFrequency] = useState(initialFrequency);

  const frequencyError = toFrequencyErrorMessage(errors);
  const genericError = toGlobalErrorMessage(errors);

  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title="Check Executions Settings"
      open={open}
      onClose={onCancel}
    >
      <div className="text-gray-500">Configure when the checks are run.</div>
      <div className="grid grid-cols-6 my-5 gap-6">
        <Label className="col-span-2" htmlFor="checks-frequency-enabled-input">
          Run Checks Periodically
        </Label>
        <div className="col-span-4">
          <Switch
            id="checks-frequency-enabled-input"
            name="checks-frequency-enabled-input"
            selected={enabled}
            disabled={loading}
            onChange={(newEnabled) => {
              setEnabled(newEnabled);
              onClearErrors();
            }}
          />
        </div>
        <Label className="col-span-2">Frequency</Label>
        <div className="col-span-4">
          <FrequencySpan
            frequency={frequency}
            disabled={!enabled || loading}
            error={Boolean(frequencyError)}
            onChange={(newFrequency) => {
              setFrequency(newFrequency);
              onClearErrors();
            }}
          />
          <Error text={frequencyError} />
        </div>
      </div>
      <div className="flex flex-row w-80 space-x-2">
        <Button
          disabled={loading}
          onClick={() => onSave({ enabled, frequency })}
        >
          Save Settings
        </Button>
        <Button type="primary-white" onClick={onCancel}>
          Close
        </Button>
      </div>
      <div className="flex flex-row w-80 space-x-2">
        <Error text={genericError} />
      </div>
    </Modal>
  );
}

export default ChecksFrequencySettingsModal;
