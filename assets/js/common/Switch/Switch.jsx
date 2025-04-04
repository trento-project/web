import React from 'react';

import classNames from 'classnames';

import { Switch as HeadlessSwitch } from '@headlessui/react';

function Switch({ onChange, selected, disabled, ...props}) {
  return (
    <HeadlessSwitch.Group as="div" className="flex items-center">
      <HeadlessSwitch
        checked={selected}
        className={classNames(
          'tn-check-switch relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full focus:outline-none transition-colors ease-in-out duration-200',
          {
            'bg-jungle-green-500': selected,
            'bg-gray-200': !selected,
            'opacity-50': disabled,
            'cursor-pointer': !disabled,
          }
        )}
        disabled={disabled}
        onChange={onChange}
        {...props}
      >
        <span
          aria-hidden="true"
          className={classNames(
            'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
            { 'translate-x-5': selected, 'translate-x-0': !selected }
          )}
        />
      </HeadlessSwitch>
    </HeadlessSwitch.Group>
  );
}

export default Switch;
