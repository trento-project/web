import React, { useState } from 'react';

import {
  EOS_VISIBILITY_OFF_OUTLINED,
  EOS_VISIBILITY_OUTLINED,
} from 'eos-icons-react';
import classNames from 'classnames';
import Input from './Input';

function Password({
  className,
  id,
  name,
  value,
  initialValue,
  placeholder = 'Password',
  error = false,
  disabled = false,
  onChange = () => {},
  ...props
}) {
  const [inputType, setInputType] = useState('password');
  return (
    <Input
      className={classNames(className)}
      id={id}
      name={name}
      value={value}
      initialValue={initialValue}
      placeholder={placeholder}
      type={inputType}
      error={error}
      disabled={disabled}
      suffix={
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            setInputType(inputType === 'password' ? 'text' : 'password')
          }
        >
          {inputType === 'password' ? (
            <EOS_VISIBILITY_OUTLINED className="inline" size="l" />
          ) : (
            <EOS_VISIBILITY_OFF_OUTLINED className="inline" size="l" />
          )}
        </button>
      }
      onChange={onChange}
      {...props}
    />
  );
}

export default Password;
