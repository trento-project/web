import React, { Fragment } from 'react';

import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

import classNames from 'classnames';

export const OPTION_ALL = 'all';

const defaultOnChange = () => {};
const defaultRenderOption = (item) => item;
const doRenderOption = (option, optionsName, renderOption) => {
  if (option === OPTION_ALL) {
    return `All ${optionsName}`;
  }
  return renderOption(option);
};

function Select({
  optionsName,
  options,
  value,
  renderOption = defaultRenderOption,
  onChange = defaultOnChange,
  className,
}) {
  const dropdownSelector = `${optionsName.replace(
    /\s+/g,
    ''
  )}-selection-dropdown`;
  return (
    <div className={classNames('flex-1 w-64 pb-4', className)}>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1">
          <Listbox.Button
            className={`${dropdownSelector} relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg cursor-default border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm`}
          >
            {doRenderOption(value, optionsName, renderOption)}
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronUpDownIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-[1]">
              {options.map((option) => (
                <Listbox.Option
                  key={option}
                  className={({ active }) =>
                    `cursor-default select-none relative py-2 pl-10 pr-4 ${
                      active ? 'text-green-900 bg-green-100' : 'text-gray-900'
                    }`
                  }
                  value={option}
                >
                  {({ selected: isSelected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          isSelected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {doRenderOption(option, optionsName, renderOption)}
                      </span>
                      {isSelected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                          <CheckIcon className="w-5 h-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

export default Select;
