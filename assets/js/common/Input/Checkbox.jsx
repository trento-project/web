// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import React from 'react';
import RcInput from 'rc-input';
import classNames from 'classnames';

function Checkbox({
  className,
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange = () => {},
  ...props
}) {
  return (
    <RcInput
      // The indeterminate state is only available as a DOM property
      ref={(element) => {
        if (element?.input) {
          element.input.indeterminate = indeterminate;
        }
      }}
      type="checkbox"
      className={classNames(
        'h-4 w-4 align-middle accent-jungle-green-500',
        { 'cursor-pointer': !disabled, 'cursor-not-allowed': disabled },
        className
      )}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      {...props}
    />
  );
}

export default Checkbox;
