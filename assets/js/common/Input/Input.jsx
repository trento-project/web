import React from 'react';

import RcInput from 'rc-input';

import { EOS_CANCEL_OUTLINED } from 'eos-icons-react';
import classNames from 'classnames';

function Input({
  className,
  id,
  name,
  type = 'text',
  value,
  initialValue,
  prefix,
  suffix,
  placeholder,
  allowClear = false,
  disabled = false,
  onChange = () => {},
}) {
  const hasPrefix = !!prefix;
  const clearIcon = <EOS_CANCEL_OUTLINED className="inline" size="l" />;

  return (
    <RcInput
      className={classNames(
        'rounded-md w-full block relative placeholder-gray-400 outline-none bg-white border border-gray-200 focus:border-gray-500 focus-visible:border-gray-500 disabled:bg-gray-50',
        { 'has-prefix': hasPrefix },
        className
      )}
      id={id}
      name={name}
      type={type}
      value={value}
      defaultValue={initialValue}
      placeholder={placeholder}
      disabled={disabled}
      suffix={disabled && allowClear ? clearIcon : suffix}
      prefix={prefix}
      allowClear={
        allowClear && !disabled
          ? {
              clearIcon,
            }
          : false
      }
      onChange={onChange}
    />
  );
}

export default Input;
