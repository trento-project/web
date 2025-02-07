import React, { useState } from 'react';
import { noop } from 'lodash';
import { EOS_WARNING_OUTLINED } from 'eos-icons-react';

import Modal from '@common/Modal';
import Button from '@common/Button';
import Input from '@common/Input';
import Label from '@common/Label';
import ProviderLabel from '@common/ProviderLabel';
import Tooltip from '@common/Tooltip';
import { UNKNOWN_PROVIDER } from '@lib/model';

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

function CheckCustomizationModal({
  open = false,
  id,
  values,
  description,
  provider = UNKNOWN_PROVIDER,
  customized = false,
  onClose = noop,
  onSave = noop,
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
      [name]: value,
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

      <div className="flex items-center border border-yellow-400 bg-yellow-50 p-4 rounded-md text-yellow-600 mb-4">
        {!customized && (
          <Input
            type="checkbox"
            checked={checked}
            onChange={() => setChecked((prev) => !prev)}
          />
        )}

        <EOS_WARNING_OUTLINED
          size="xxl"
          className="centered fill-yellow-500 ml-4 mr-4"
        />
        <span className="font-semibold">{checkBoxWarningText}</span>
      </div>
      {values
        ?.filter(({ customizable }) => customizable)
        .map((value) => (
          <div
            key={`${value?.name}_${value?.current_value}`}
            className="flex items-center space-x-2 mb-8"
          >
            <div className="flex-col w-1/3 min-w-[200px]">
              {renderLabelWithTooltip(value?.name)}
              <Label>(Default: {value?.current_value})</Label>
            </div>

            <Input
              className="w-full"
              onChange={(inputEvent) =>
                handleCustomValueInput(value?.name, inputEvent.target.value)
              }
              placeholder={value?.current_value}
              disabled={!canCustomize}
            />
          </div>
        ))}

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

      <div className="flex flex-row w-80">
        <div className="flex flex-row w-24 mt-3 rounded-md">
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
        </div>
        <div className="flex flex-row w-24 mt-3 rounded-md">
          <Button
            type="primary-white"
            className="w-1/2"
            onClick={resetStateAndClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CheckCustomizationModal;
