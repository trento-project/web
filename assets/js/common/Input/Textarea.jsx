import React, { useState } from 'react';
import classNames from 'classnames';

function Textarea({
  id,
  name,
  className,
  value,
  initialValue,
  placeholder,
  error = false,
  disabled = false,
  onChange,
}) {
  const [initialInputValue, setValue] = useState(initialValue);
  const defaultOnChange = (e) => setValue(e.target.value);

  return (
    <textarea
      className={classNames(
        'rc-input outline-none bg-white border border-gray-200 px-3 py-2 rounded-md placeholder-gray-400 w-full block disabled:bg-gray-50',
        {
          'border-gray-200': !error,
          'border-red-500': error,
          'focus:border-gray-500': !error,
          'focus-visible:border-red-500': error,
        },
        className
      )}
      rows={5}
      id={id}
      name={name}
      placeholder={placeholder}
      disabled={disabled}
      value={value || initialInputValue}
      onChange={onChange || defaultOnChange}
    />
  );
}

export default Textarea;
