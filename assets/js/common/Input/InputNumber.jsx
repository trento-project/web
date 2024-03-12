import React from 'react';
import RcInputNumber from 'rc-input-number';

import classNames from 'classnames';

function InputNumber({
  className,
  id,
  name,
  value,
  initialValue,
  placeholder,
  error = false,
  disabled = false,
  onChange = () => {},
  ...props
}) {
  return (
    <RcInputNumber
      className={classNames(
        'rounded-md w-full block relative placeholder-gray-400 outline-none bg-white border disabled:bg-gray-50',
        {
          'border-gray-200': !error,
          'focus:border-gray-500': !error,
          'focus-visible:border-red-500': error,
          'border-red-500': error,
        },
        className
      )}
      id={id}
      name={name}
      value={value}
      defaultValue={initialValue}
      placeholder={placeholder}
      disabled={disabled}
      onChange={onChange}
      {...props}
    />
  );
}

export default InputNumber;
