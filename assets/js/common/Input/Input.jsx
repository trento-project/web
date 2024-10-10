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
  error = false,
  allowClear = false,
  disabled = false,
  onChange = () => {},
  ...props
}) {
  const hasPrefix = !!prefix;
  const clearIcon = <EOS_CANCEL_OUTLINED className="inline" size="l" />;

  return (
    <div className={className}>
      <RcInput
        className={classNames(
          'rounded-md w-full block relative placeholder-gray-400 outline-none bg-white border disabled:bg-gray-50',
          {
            'has-prefix': hasPrefix,
            'border-gray-200': !error,
            'focus:border-gray-500': !error,
            'focus-visible:border-red-500': error,
            'border-red-500': error,
          },
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
        {...props}
      />
    </div>
  );
}

export default Input;
