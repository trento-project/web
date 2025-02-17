import React, { useState } from 'react';

const isDefaultValue = (defaultCheckValue, customCheckValue) =>
  customCheckValue === undefined || defaultCheckValue === customCheckValue;

const renderDefaultLabel = (isDefault) =>
  isDefault ? <span className="pl-2">(Default)</span> : null;

const inputOptions = [
  { label: 'True', radioValue: true },
  { label: 'False', radioValue: false },
];

function CheckCustomizationBooleanInput({
  name,
  defaultCheckValue,
  customCheckValue,
  currentValue = '',
  inputIsLocked,
  handleInput = () => {},
  renderLabelWithTooltip = () => {},
}) {
  const [selectedValue, setSelectedValue] = useState(currentValue);

  const handleChange = (event) => {
    const newValue = event.target.value === 'true';
    setSelectedValue(newValue);
    handleInput(name, newValue);
  };

  return (
    <div
      key={`${name}_${currentValue}`}
      className="flex items-center space-x-2 mb-8"
    >
      <div className="flex-col w-1/3 min-w-[200px]">
        {renderLabelWithTooltip(name)}
      </div>
      <div className="w-full space-x-4">
        {inputOptions.map(({ label, radioValue }) => (
          <label
            key={`${name}_${radioValue}`}
            className="inline-flex items-center"
          >
            <input
              type="radio"
              value={radioValue}
              checked={selectedValue === radioValue}
              onChange={handleChange}
              disabled={inputIsLocked}
            />{' '}
            {label}{' '}
            {renderDefaultLabel(
              isDefaultValue(defaultCheckValue, customCheckValue) &&
                defaultCheckValue === radioValue
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

export default CheckCustomizationBooleanInput;
