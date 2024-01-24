import React, { useState } from 'react';

function Textarea({
  id,
  name,
  value,
  initialValue,
  placeholder,
  disabled = false,
  onChange,
}) {
  const [initialInputValue, setValue] = useState(initialValue);
  const defaultOnChange = (e) => setValue(e.target.value);
  return (
    <textarea
      className="rc-input outline-none bg-white border border-gray-200 focus:border-gray-500 focus-visible:border-gray-500 px-3 py-2 rounded-md placeholder-gray-400 w-full block disabled:bg-gray-50"
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
