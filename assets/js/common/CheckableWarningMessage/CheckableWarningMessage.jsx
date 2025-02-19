import React from 'react';
import Input from '@common/Input';
import { noop } from 'lodash';
import { EOS_WARNING_OUTLINED } from 'eos-icons-react';

function CheckableWarningMessage({
  hideCheckbox = false,
  warningText,
  checked,
  setChecked = noop,
}) {
  return (
    <div className="flex items-center border border-yellow-400 bg-yellow-50 p-4 rounded-md text-yellow-600 mb-4">
      {!hideCheckbox && (
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
      <span className="font-semibold">{warningText}</span>
    </div>
  );
}

export default CheckableWarningMessage;
