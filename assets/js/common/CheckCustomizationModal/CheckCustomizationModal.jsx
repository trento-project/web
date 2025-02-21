import React, { useState } from 'react';
import { noop, isBoolean, toNumber } from 'lodash';

import Modal from '@common/Modal';
import Button from '@common/Button';

import Label from '@common/Label';
import ProviderLabel from '@common/ProviderLabel';
import Tooltip from '@common/Tooltip';
import Input from '@common/Input';

import CheckableWarningMessage from '@common/CheckableWarningMessage';
import { UNKNOWN_PROVIDER } from '@lib/model';

import CheckCustomizationBooleanInput from './CheckCustomizationBooleanInput';
import CheckCustomizationDefaultInput from './CheckCustomizationDefaultInput';

const checkBoxWarningText =
  'Trento & SUSE cannot be held liable for damages if system is unable to function due to custom check value.';

const buildCustomCheckPayload = (checkID, values) => {
  const payload = {
    checksID: checkID,
    customValues: values,
  };
  return payload;
};

const renderLabelWithTooltip = (name) => {
  const labelContent = (
    <Label className="block truncate max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
      {name}:
    </Label>
  );

  return name?.length > 25 ? (
    <Tooltip zIndex="50" content={name}>
      {labelContent}
    </Tooltip>
  ) : (
    labelContent
  );
};
const valueWasCustomized = (value) =>
  value?.custom_value ?? value?.current_value;

function CheckCustomizationModal({
  open = false,
  id,
  values,
  description,
  provider = UNKNOWN_PROVIDER,
  customized = false,
  onClose = noop,
  onSave = noop,
  onReset = noop,
}) {
  const [checked, setChecked] = useState(customized);
  const [customValues, setCustomValues] = useState({});
  const canCustomize = customized || checked;

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
        .map((value) =>
          isBoolean(valueWasCustomized(value)) ? (
            <CheckCustomizationBooleanInput
              key={value?.name}
              name={value?.name}
              defaultCheckValue={value?.current_value}
              customCheckValue={value?.custom_value}
              currentValue={valueWasCustomized(value)}
              inputIsLocked={!canCustomize}
              handleInput={handleCustomValueInput}
              renderLabelWithTooltip={renderLabelWithTooltip}
            />
          ) : (
            <CheckCustomizationDefaultInput
              key={value?.name}
              name={value?.name}
              defaultCheckValue={value?.current_value}
              currentValue={valueWasCustomized(value)}
              inputIsLocked={!canCustomize}
              handleInput={handleCustomValueInput}
              renderLabelWithTooltip={renderLabelWithTooltip}
            />
          )
        )}

      <div className="flex items-center space-x-2 mb-8">
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

      <div className="flex w-80 flex-row space-x-2">
        <Button
          type="default-fit"
          className="w-1/2"
          disabled={!canCustomize}
          onClick={() => {
            onSave(buildCustomCheckPayload(id, customValues));
            resetStateAndClose();
          }}
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
