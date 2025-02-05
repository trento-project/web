import React, { useState } from 'react';
import { noop } from 'lodash';
import { EOS_WARNING_OUTLINED } from 'eos-icons-react';

import Modal from '@common/Modal';
import Button from '@common/Button';
import Input from '@common/Input';
import Label from '@common/Label';
import ProviderLabel from '@common/ProviderLabel';

function CustomCheckModal({
  open = false,
  selectedCheckID,
  selectedCheckValues,
  selectedCheckDescription,
  provider = 'Unknown',
  isChecked = false,
  onClose = noop,
  onSave = noop,
}) {
  const checkTitle = `Check: ${selectedCheckID}`;
  const [checked, setChecked] = useState(isChecked);
  const [customValues, setCustomValues] = useState({});

  const checkBoxWarningText =
    'Trento & SUSE cannot be held liable for damages if system is unable to function due to custom check value.';

  const handleCustomValueInput = (name, value) => {
    setCustomValues((previousValues) => ({
      ...previousValues,
      [name]: value,
    }));
  };

  const buildCustomCheckPayload = (checkID, values) => {
    const payload = {
      checksID: checkID,
      customValues: values,
    };
    return payload;
  };

  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title={checkTitle}
      open={open}
      onClose={() => {
        setCustomValues({});
        setChecked(false);
        onClose();
      }}
    >
      <p className="text-gray-500 text-sm font-normal tracking-wide pb-2">
        {selectedCheckDescription}
      </p>

      <div className="flex items-center border border-yellow-400 bg-yellow-50 p-4 rounded-md text-yellow-600 mb-4">
        <Input
          type="checkbox"
          checked={checked}
          onChange={() => setChecked((prev) => !prev)}
        />
        <EOS_WARNING_OUTLINED
          size="xxl"
          className="centered fill-yellow-500 ml-4 mr-4"
        />
        <span className="font-semibold">{checkBoxWarningText}</span>
      </div>
      {selectedCheckValues?.map((value) => (
        <div
          key={`${value?.name}_${value?.default}`}
          className="flex items-center space-x-2 mb-8"
        >
          <div className="w-1/3 min-w-[150px]">
            <Label className="block break-words">
              {value?.name}: (Default: {value?.default})
            </Label>
          </div>
          <Input
            className="w-full"
            onChange={(inputEvent) =>
              handleCustomValueInput(value?.name, inputEvent.target.value)
            }
            placeholder="Value from Wanda"
            disabled={!checked || !value?.customizable}
          />
        </div>
      ))}

      <div className="flex items-center space-x-2 mb-8">
        <div className="w-1/3 min-w-[150px]">
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
            disabled={!checked}
            onClick={() => {
              setCustomValues({});
              setChecked(false);
              onSave(buildCustomCheckPayload(selectedCheckID, customValues));
              onClose();
            }}
          >
            Save
          </Button>
        </div>
        <div className="flex flex-row w-24 mt-3 rounded-md">
          <Button
            type="primary-white"
            className="w-1/2"
            onClick={() => {
              onClose();
              setCustomValues({});
              setChecked(false);
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CustomCheckModal;
