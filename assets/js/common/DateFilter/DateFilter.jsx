import React, { Fragment, useState, useRef } from 'react';
import classNames from 'classnames';
import { Transition } from '@headlessui/react';
import { format as formatDate } from 'date-fns-tz';

import useOnClickOutside from '@hooks/useOnClickOutside';
import { EOS_CLOSE, EOS_CHECK } from 'eos-icons-react';

import Input from '@common/Input';

const oneHour = 60 * 60 * 1000;
const preconfiguredOptions = {
  '1h ago': () => new Date(Date.now() - oneHour),
  '24h ago': () => new Date(Date.now() - 24 * oneHour),
  '7d ago': () => new Date(Date.now() - 7 * 24 * oneHour),
  '30d ago': () => new Date(Date.now() - 30 * 24 * oneHour),
};

const toHumanDate = (date) =>
  date && date instanceof Date && formatDate(date, 'MM/dd/yyyy hh:mm:ss a');

const renderOptionItem = (option, placeholder) => {
  if (!option || !Array.isArray(option)) {
    return placeholder;
  }
  if (typeof option[2] === 'function') {
    return option[2]();
  }
  return option[0];
};

const parseInputOptions = (options) =>
  options
    .map((option) => {
      if (typeof option === 'string' && option in preconfiguredOptions) {
        return [option, preconfiguredOptions[option]];
      }
      if (
        Array.isArray(option) &&
        typeof option[1] === 'function' &&
        option[1]() instanceof Date
      ) {
        return option;
      }
      return undefined;
    })
    .filter(Boolean)
    .reduceRight(
      (acc, el) =>
        acc.find(([label]) => label === el[0]) ? acc : [...acc, el],
      []
    )
    .sort((a, b) => b[1]().getTime() - a[1]().getTime());

const getSelectedOption = (options, value) => {
  const selectedId = Array.isArray(value) ? value[0] : value;
  if (selectedId === 'custom') {
    const date = new Date(value[1]);
    return ['custom', date, () => toHumanDate(date)];
  }
  if (typeof selectedId === 'string') {
    return options.find((option) => option[0] === selectedId);
  }
  return undefined;
};

function Tick() {
  return (
    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
      <EOS_CHECK size="m" />
    </span>
  );
}

function DateTimeInput({ value, onChange }) {
  const dateToValue = (date) => formatDate(date, "yyyy-MM-dd'T'HH:mm:ss.SSS");

  return (
    <Input
      value={value && dateToValue(value)}
      onChange={(e) => {
        onChange(new Date(`${e.target.value}`));
      }}
      type="datetime-local"
    />
  );
}

/**
 * A component for filtering dates.
 *
 * @component
 * @example
 * // <DateFilter
 * //   options={['1h ago', '24h ago', '7d ago', '30d ago']}
 * //   title="Date"
 * //   value="24h ago"
 * //   prefilled
 * //   onChange={(value) => console.log(value)}
 * // />
 *
 * @param {Object} props - The component props.
 * @param {Array} props.options - The options for the date filter. Each option can be a triple with a an id, a value function and an optional render function.
 * The value function should return a Date object; the actual date value is calculated at selection time.
 * In case the render function is not provided, the id will be used as the label.
 * An option can also be a string, in which case it will be considered as a pre-configured option.
 * In case more options with the same id are provided, only the last one will be considered.
 * Options will be displayed sorted by date in descending order.
 * @param {string} props.title - The title of the date filter, to be shown as placeholder when no value is selected.
 * @param {string} props.value - The selected id of the selected option. It accepted either a string or an array with the id as the first element.
 * @param {boolean} props.prefilled - Whether to include pre-configured options in the options list. Default is true.
 * @param {function} props.onChange - The callback function to be called when the value of the date filter changes. It will provide a couple with the selected id and the actual date.
 */
function DateFilter({
  options = [],
  title,
  value,
  prefilled = true,
  onChange,
}) {
  const ref = useRef();
  const [open, setOpen] = useState(false);

  const parsedOptions = parseInputOptions(
    prefilled ? [...Object.entries(preconfiguredOptions), ...options] : options
  );

  const selectedOption = getSelectedOption(parsedOptions, value);

  useOnClickOutside(ref, () => setOpen(false));

  const text = renderOptionItem(selectedOption, `Filter ${title}...`);

  return (
    <div className="flex-1 w-64 top-16" ref={ref}>
      <div className="mt-1 relative">
        {selectedOption && (
          <button
            type="button"
            aria-label="Clear filter"
            data-testid={`filter-${title}-clear`}
            className="block absolute z-20 right-0 h-full pr-2 flex items-center"
            onClick={() => onChange(undefined)}
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
                'text-gray-500': !value,
              })}
            >
              {text}
            </span>
          </span>
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            {!selectedOption && (
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
          show={open}
        >
          <div className="absolute mt-1 w-full z-10 rounded-md bg-white shadow-lg">
            <div className="ring-1 ring-black ring-opacity-5 rounded-md">
              <ul
                tabIndex="-1"
                role="listbox"
                data-testid={`filter-${title}-options`}
                aria-labelledby="listbox-label"
                className="max-h-56 py-2 text-base overflow-auto focus:outline-none sm:text-sm"
              >
                {parsedOptions
                  .map((option) => ({
                    key: option[0],
                    onItemClick: () => onChange([option[0], option[1]()]),
                    label: renderOptionItem(option),
                    isSelected:
                      selectedOption && selectedOption[0] === option[0],
                  }))
                  .map(({ key, label, isSelected, onItemClick }) => (
                    <li
                      key={key}
                      role="option"
                      aria-selected={isSelected}
                      aria-hidden="true"
                      className="text-gray-900 cursor-default select-none hover:bg-jungle-green-500 hover:text-white relative py-2 pl-3 pr-9"
                      onClick={onItemClick}
                    >
                      <div className="flex items-center">
                        <span className="ml-3 block font-normal truncate">
                          {label}
                          {isSelected && <Tick />}
                        </span>
                      </div>
                    </li>
                  ))}
                <li
                  role="option"
                  aria-selected={
                    selectedOption && selectedOption[0] === 'custom'
                  }
                  aria-hidden="true"
                  className="text-gray-900 cursor-default select-none hover:bg-jungle-green-500 hover:text-white relative py-2 pl-3 pr-9"
                >
                  <div className="flex items-center">
                    <span className="ml-3 block font-normal truncate">
                      <DateTimeInput
                        value={
                          selectedOption &&
                          selectedOption[0] === 'custom' &&
                          selectedOption[1]
                        }
                        onChange={(date) => onChange(['custom', date])}
                      />
                      {selectedOption && selectedOption[0] === 'custom' && (
                        <Tick />
                      )}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
}

export default DateFilter;
