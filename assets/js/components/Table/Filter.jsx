import React, { Fragment, useState, useRef } from 'react';
import classNames from 'classnames';
import { Transition } from '@headlessui/react';

import { toggle, hasOne } from '@lib/lists';
import useOnClickOutside from '@hooks/useOnClickOutside';
import { EOS_CLOSE } from 'eos-icons-react';

const getLabel = (value, placeholder) =>
  value.length === 0 ? placeholder : value.join(', ');

const Filter = ({ options, title, value, onChange }) => {
  const ref = useRef();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredOptions = options
    .filter((option) => option !== undefined && option !== null)
    .filter((option) => option.toLowerCase().includes(query.toLowerCase()));

  useOnClickOutside(ref, () => setOpen(false));
  return (
    <div className="w-64 w-72 top-16 mr-4" ref={ref}>
      <div className="mt-1 relative">
        {value != '' && (
          <button
            className="block absolute z-20 right-0 h-full pr-2 flex items-center"
            onClick={() => onChange([])}
          >
            <EOS_CLOSE
              size="20"
              className="text-gray-400"
              color="currentColor"
            />
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="relative w-full bg-white rounded-md shadow pl-3 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-jungle-green-500 focus:border-jungle-green-500 sm:text-sm"
        >
          <span className="flex items-center">
            <span
              className={classNames('ml-3 block truncate', {
                'text-gray-500': value.length === 0,
              })}
            >
              {getLabel(value, `Filter ${title}...`)}
            </span>
          </span>
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            {value == '' && (
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
                ></path>
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
          <div className="absolute mt-1 w-full z-10 rounded-md bg-white shadow-lg">
            <div className="ring-1 ring-black ring-opacity-5 rounded-md">
              <div className="pt-2 pb-1 px-2 flex justify-center">
                <input
                  className="rounded-lg flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-jungle-green-500 focus:border-transparent"
                  value={query}
                  onChange={({ target: { value } }) => setQuery(value)}
                />
              </div>
              <ul
                tabIndex="-1"
                role="listbox"
                aria-labelledby="listbox-label"
                className="max-h-56 py-2 text-base overflow-auto focus:outline-none sm:text-sm"
              >
                {filteredOptions.map((option, index) => (
                  <li
                    key={index}
                    role="option"
                    className="text-gray-900 cursor-default select-none hover:bg-jungle-green-500 hover:text-white relative py-2 pl-3 pr-9"
                    onClick={() => onChange(toggle(option, value))}
                  >
                    <div className="flex items-center">
                      <span className="ml-3 block font-normal truncate">
                        {option}
                      </span>
                    </div>
                    {hasOne(value, [option]) && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
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
};

export default Filter;
