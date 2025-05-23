/* eslint-disable react/no-array-index-key */

import React, { Fragment, useState, useRef } from 'react';
import classNames from 'classnames';
import { Transition } from '@headlessui/react';
import { EOS_CLOSE, EOS_CHECK } from 'eos-icons-react';

import { toggle, hasOne } from '@lib/lists';
import useOnClickOutside from '@hooks/useOnClickOutside';

const getLabel = (value, placeholder) =>
  value.length === 0 ? placeholder : value.join(', ');

function Label({ icon, label }) {
  if (icon instanceof Object) {
    return (
      <div className="flex items-center gap-1">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center">
      <span className="ml-3 block font-normal truncate">{label}</span>
    </div>
  );
}

/**
 * Filter component
 *
 * @param {string[]|[string, string][]} props.options List of options to filter, e.g. ['Option 1', 'Option 2']
 * @param {string} props.title Title of the filter. It will be displayed in the button when the filter is empty
 * @param {string|string[]} props.value Selected options. Default is an empty array
 * @param {function} props.onChange Function to call when the selected options change
 * @param {string} props.className Additional classes to apply to the filter
 */
function Filter({ options, title, value = [], onChange, className }) {
  const ref = useRef();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const labeledOptions = options
    .filter((option) => option !== undefined && option !== null)
    .map((option) =>
      typeof option === 'string' ? [option, option, ''] : option
    );

  const filteredOptions = labeledOptions.filter((option) =>
    option[0].toLowerCase().includes(query.toLowerCase())
  );

  const parsedValue = typeof value === 'string' ? [value] : value;

  const selectedLabels = parsedValue.reduce((acc, key) => {
    const element = labeledOptions.find(([optionKey]) => optionKey === key);
    return element ? [...acc, element[1]] : acc;
  }, []);

  useOnClickOutside(ref, () => setOpen(false));

  return (
    <div className={classNames('top-16', className)} ref={ref}>
      <div className="relative">
        {parsedValue.length !== 0 && (
          <button
            type="button"
            aria-label="Clear filter"
            data-testid={`filter-${title}-clear`}
            className="block absolute z-20 right-0 h-full pr-2 flex items-center"
            onClick={() => onChange([])}
          >
            <EOS_CLOSE
              size="20"
              className="text-gray-400 hover:text-gray-500"
              color="currentColor"
            />
          </button>
        )}
        <button
          type="button"
          data-testid={`filter-${title}`}
          onClick={() => setOpen(!open)}
          className="relative w-full bg-white hover:bg-gray-50 rounded-md border pl-3 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-jungle-green-500 focus:border-jungle-green-500 sm:text-sm"
        >
          <span className="flex items-center">
            <span
              className={classNames('ml-3 block truncate', {
                'text-gray-500': parsedValue.length === 0,
              })}
            >
              {getLabel(selectedLabels, `Filter ${title}...`)}
            </span>
          </span>
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            {parsedValue.length === 0 && (
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
        </button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
          show={open}
        >
          <div className="absolute mt-1 z-10 rounded-md bg-white shadow-lg min-w-full">
            <div className="ring-1 ring-black ring-opacity-5 rounded-md">
              <div className="pt-2 pb-1 px-2 flex justify-center">
                <input
                  className="rounded-lg flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-jungle-green-500 focus:border-transparent"
                  value={query}
                  onChange={({ target: { value: newValue } }) =>
                    setQuery(newValue)
                  }
                />
              </div>
              <ul
                tabIndex="-1"
                role="listbox"
                data-testid={`filter-${title}-options`}
                aria-labelledby="listbox-label"
                className="max-h-56 py-2 text-base overflow-auto focus:outline-none sm:text-sm"
              >
                {filteredOptions.map(([key, label, icon], index) => (
                  <li
                    key={index}
                    role="option"
                    aria-selected={hasOne(parsedValue, [key])}
                    aria-hidden="true"
                    className="text-gray-900 cursor-default select-none hover:bg-jungle-green-500 hover:text-white relative py-2 pl-3 pr-9"
                    onClick={() => onChange(toggle(key, parsedValue))}
                  >
                    <Label icon={icon} label={label} />
                    {hasOne(parsedValue, [key]) && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <EOS_CHECK size="m" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
}

export default Filter;
