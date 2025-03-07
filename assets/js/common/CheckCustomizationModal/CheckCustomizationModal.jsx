import React, { useEffect, useState } from 'react';
import { noop, isBoolean, toNumber, isEmpty } from 'lodash';
import { pipe, map, entries } from 'lodash/fp';

import Modal from '@common/Modal';
import Button from '@common/Button';
import Label from '@common/Label';
import ProviderLabel from '@common/ProviderLabel';
import Input from '@common/Input';

import CheckableWarningMessage from '@common/CheckableWarningMessage';
import { UNKNOWN_PROVIDER } from '@lib/model';

import {
  isOngoing,
  isFailed,
  isGenericFailure,
  isInvalidValues,
} from '@pages/ChecksSelection/hooks';

import CheckCustomizationInput from './CheckCustomizationInput';

const checkBoxWarningText =
  'Trento & SUSE cannot be held liable for damages if system is unable to function due to custom check value.';

const appliedValue = (value) => value?.custom_value ?? value?.current_value;

const detectType = (value) => {
  if (isBoolean(value)) {
    return 'boolean';
  }

  return 'default';
};

function CheckCustomizationModal({
  open = false,
  id,
  groupID,
  values,
  description,
  provider = UNKNOWN_PROVIDER,
  customized = false,
  onClose = noop,
  onSave = noop,
  onReset = noop,
  customizationStatus,
}) {
  const [checked, setChecked] = useState(customized);
  const [customValues, setCustomValues] = useState({});
  const canCustomize = customized || checked;
  const canSave =
    !isEmpty(customValues) && canCustomize && !isOngoing(customizationStatus);

  const checkTitle = `Check: ${id}`;
  const resetStateAndClose = () => {
    setCustomValues({});
    setChecked(false);
    onClose();
  };

  const handleCustomValueInput = (name, value) => {
    setCustomValues((previousValues) => ({
      ...previousValues,
      [name]: isBoolean(value) ? value : toNumber(value) || value,
    }));
  };

  useEffect(() => {
    setChecked(customized);
  }, [customized]);

  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title={checkTitle}
      open={open}
      onClose={resetStateAndClose}
    >
      <p className="text-gray-500 text-sm font-normal tracking-wide pb-2">
        {description}
      </p>
      <CheckableWarningMessage
        hideCheckbox={customized}
        checked={checked}
        onChecked={() => setChecked((prev) => !prev)}
      >
        {checkBoxWarningText}
      </CheckableWarningMessage>
      {values
        ?.filter(({ customizable }) => customizable)
        .map((value) => (
          <CheckCustomizationInput
            key={value?.name}
            name={value?.name}
            defaultCheckValue={value?.current_value}
            currentValue={appliedValue(value)}
            inputIsLocked={!canCustomize}
            handleInput={handleCustomValueInput}
            inputType={detectType(appliedValue(value))}
          />
        ))}

      <div className="flex items-center space-x-2 mb-5">
        <div className="w-1/3 min-w-[200px]">
          <Label>Provider</Label>
        </div>

        <div className="relative w-full">
          <Input className="w-full" disabled />

          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 flex items-center ">
            <ProviderLabel provider={provider} />
          </div>
        </div>
      </div>
      {isFailed(customizationStatus) && (
        <div
          data-testid="error-message"
          className="flex flex-row space-x-2 mb-2"
        >
          <p className="text-red-500 mt-1">
            {isInvalidValues(customizationStatus) &&
              'Some of the values are invalid. Please correct them and try again'}
            {isGenericFailure(customizationStatus) &&
              'An error occurred while saving custom values'}
          </p>
        </div>
      )}

      <div className="flex w-80 flex-row space-x-2">
        <Button
          type="default-fit"
          className="w-1/2"
          disabled={!canSave}
          onClick={() =>
            pipe(
              entries,
              map(([name, value]) => ({ name, value })),
              (payload) => onSave(id, groupID, payload)
            )(customValues)
          }
        >
          Save
        </Button>
        <Button
          type="primary-white-fit"
          className="w-1/2"
          onClick={onReset}
          disabled={!customized}
        >
          Reset Check
        </Button>
        <Button
          type="primary-white-fit"
          className="w-1/2"
          onClick={resetStateAndClose}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}

export default CheckCustomizationModal;
