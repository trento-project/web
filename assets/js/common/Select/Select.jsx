import React, { Fragment } from 'react';

import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

import classNames from 'classnames';
import { find, get } from 'lodash';

export const OPTION_ALL = 'all';

const defaultOnChange = () => {};
const defaultRenderOption = (item) => item.value;

function Select({
  optionsName,
  options,
  value,
  renderOption = defaultRenderOption,
  onChange = defaultOnChange,
  className,
  disabled = false,
}) {
  const enrichedOptions = options.map((option) => ({
    value: get(option, 'value', option),
    disabled: get(option, 'disabled', false),
  }));
  const selectedOption = find(enrichedOptions, { value });
  const dropdownSelector = `${optionsName.replace(
    /\s+/g,
    ''
  )}-selection-dropdown`;

  return (
    <div className={classNames('flex-2 w-64 pb-4', className)}>
      <Listbox disabled={disabled} value={value} onChange={onChange}>
        <div className="relative mt-1">
          <Listbox.Button
            className={classNames(
              dropdownSelector,
              'relative w-full py-2 px-3 text-left bg-white rounded-lg cursor-default border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-400'
            )}
          >
            {renderOption(selectedOption)}
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
              {enrichedOptions.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active, disabled: optionDisabled }) =>
                    classNames(
                      'cursor-default select-none relative py-2 px-3',
                      {
                        'text-gray-400': optionDisabled,
                        'text-green-900 bg-green-100': active,
                        'text-gray-900': !optionDisabled && !active,
                      }
                    )
                  }
                  value={option.value}
                  disabled={option.disabled}
                >
                  {({ selected: isSelected }) => (
                    <>
                      <span
                        className={classNames('block', 'truncate', {
                          'font-medium': isSelected,
                          'font-normal': !isSelected,
                        })}
                      >
                        {renderOption(option)}
                      </span>
                      {isSelected ? (
                        <span className="absolute inset-y-0 right-2 end-1 flex items-center pl-3 text-green-600">
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
