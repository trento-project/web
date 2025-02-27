import React, { useState } from 'react';
import { noop, capitalize, isBoolean } from 'lodash';
import Input from '@common/Input';
import Tooltip from '@common/Tooltip';
import Label from '@common/Label';

const inputOptions = [
  { label: 'True', radioValue: true },
  { label: 'False', radioValue: false },
];

const renderLabel = (name, defaultCheckValue) => {
  const formatDefaultValue = (value) =>
    isBoolean(value) ? capitalize(String(value)) : value;

  const labelContent = (
    <Label className="block truncate max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
      {name}:<br />
      (Default: {formatDefaultValue(defaultCheckValue)})
    </Label>
  );

  return (
    <Tooltip zIndex="50" content={name} isEnabled={name?.length > 25}>
      {labelContent}
    </Tooltip>
  );
};

function CheckCustomizationInput({
  name,
  defaultCheckValue,
  currentValue = '',
  inputIsLocked,
  inputType,
  handleInput = noop,
}) {
  const [selectedValue, setSelectedValue] = useState(currentValue);

  const handleBooleanChange = (event) => {
    const newValue = event.target.value === 'true';
    setSelectedValue(newValue);
    handleInput(name, newValue);
  };

  const handleDefaultChange = (inputEvent) => {
    handleInput(name, inputEvent.target.value);
  };

  const renderInput = (type) => {
    switch (type) {
      case 'boolean':
        return (
          <>
            {inputOptions.map(({ label, radioValue }) => (
              <label key={label} className="inline-flex items-center">
                <Input
                  type="radio"
                  name={name}
                  value={String(radioValue)}
                  checked={selectedValue === radioValue}
                  onChange={handleBooleanChange}
                  disabled={inputIsLocked}
                  className="w-full mr-1"
                />
                {label}
              </label>
            ))}
          </>
        );

      default:
        return (
          <Input
            name={name}
            onChange={handleDefaultChange}
            initialValue={currentValue}
            disabled={inputIsLocked}
            className="w-full mr-1"
          />
        );
    }
  };

  return (
    <div
      key={`${name}_${currentValue}`}
      className="flex items-center space-x-2 mb-8"
    >
      <div className="flex-col w-1/3 min-w-[200px]">
        {renderLabel(name, defaultCheckValue)}
      </div>
      <div className="w-full space-x-4">{renderInput(inputType)}</div>
    </div>
  );
}

export default CheckCustomizationInput;
