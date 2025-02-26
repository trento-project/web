import React from 'react';
import Input from '@common/Input';

function CheckCustomizationDefaultInput({
  name,
  defaultCheckValue,
  currentValue = '',
  inputIsLocked,
  handleInput = () => {},
  renderLabelWithTooltip = () => {},
}) {
  return (
    <div
      key={`${name}_${currentValue}`}
      className="flex items-center space-x-2 mb-8"
    >
      <div className="flex-col w-1/3 min-w-[200px]">
        {renderLabelWithTooltip(name, defaultCheckValue)}
      </div>

      <Input
        className="w-full"
        onChange={(inputEvent) => handleInput(name, inputEvent.target.value)}
        initialValue={currentValue}
        disabled={inputIsLocked}
      />
    </div>
  );
}

export default CheckCustomizationDefaultInput;
