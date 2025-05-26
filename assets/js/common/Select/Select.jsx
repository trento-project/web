import React, { Fragment } from 'react';
import classNames from 'classnames';

import { isEqual } from 'lodash';

import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition,
} from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

import {
  normalizeOptions,
  defaultFetchSelectedOption,
  defaultRenderOption,
} from './lib';

const defaultOnChange = () => {};

const deepCompareSelection = (optionValue, value) =>
  isEqual(optionValue, value);

function Select({
  optionsName,
  options,
  value,
  renderOption = defaultRenderOption,
  onChange = defaultOnChange,
  className,
  disabled = false,
  optionsListPosition = '',
  selectedItemPrefix = null,
  fetchSelectedOption = defaultFetchSelectedOption,
}) {
  const enrichedOptions = normalizeOptions(options);
  const selectedOption = fetchSelectedOption(enrichedOptions, value);
  const dropdownSelector = `${optionsName.replace(
    /\s+/g,
    ''
  )}-selection-dropdown`;

  return (
    <Listbox
      className={classNames('flex-1', className)}
      disabled={disabled}
      value={value}
      onChange={onChange}
      by={deepCompareSelection}
    >
      <div className="relative">
        <ListboxButton
          className={classNames(
            dropdownSelector,
            'relative w-full py-2 pl-3 pr-7 text-left bg-white rounded cursor-default border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-400 h-full'
          )}
        >
          {selectedItemPrefix}
          {renderOption(selectedOption)}
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronUpDownIcon
              className="w-5 h-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions
            className={classNames(
              'absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-40',
              {
                'bottom-11': optionsListPosition === 'top',
              }
            )}
          >
            {enrichedOptions.map((option) => (
              <ListboxOption
                key={option.key}
                className={({ focus, disabled: optionDisabled }) =>
                  classNames('cursor-default select-none relative py-2 px-3', {
                    'text-gray-400': optionDisabled,
                    'text-green-900 bg-green-100': focus,
                    'text-gray-900': !optionDisabled && !focus,
                  })
                }
                value={option.value}
                disabled={option.disabled}
              >
                {({ selected: isSelected }) => (
                  <>
                    <span
                      className={classNames('block', 'truncate', {
                        'font-medium pr-5': isSelected,
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
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox>
  );
}

export default Select;
