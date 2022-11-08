import React from 'react';

import classNames from 'classnames';

import { Disclosure, Switch, Transition } from '@headlessui/react';

import { EOS_KEYBOARD_ARROW_RIGHT } from 'eos-icons-react';

const ChecksSelectionGroup = ({
  children,
  group,
  allSelected,
  someSelected,
  noneSelected,
  onChange = () => {},
}) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md mb-1">
      <Disclosure>
        {({ open }) => (
          <>
            <div className="flex hover:bg-gray-100 border-b border-gray-200">
              <Switch.Group
                as="div"
                className="flex items-center hover:bg-white pl-2"
              >
                <Switch
                  checked={allSelected}
                  className={classNames(
                    {
                      'bg-jungle-green-500': allSelected,
                      'bg-green-300': someSelected,
                      'bg-gray-200': noneSelected,
                    },
                    'tn-check-switch relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer focus:outline-none transition-colors ease-in-out duration-200'
                  )}
                  onChange={onChange}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      {
                        'translate-x-5': allSelected,
                        'translate-x-2.5': someSelected,
                        'translate-x-0': noneSelected,
                      },
                      'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    )}
                  />
                </Switch>
              </Switch.Group>
              <Disclosure.Button
                as="div"
                className="flex justify-between w-full cursor-pointer bg-white px-4 py-5 sm:px-6 hover:bg-gray-100"
              >
                <h3 className="tn-check-switch text-lg leading-6 font-medium text-gray-900">
                  {group}
                </h3>

                <EOS_KEYBOARD_ARROW_RIGHT
                  className={`${open ? 'transform rotate-90' : ''}`}
                />
              </Disclosure.Button>
            </div>

            {open && (
              <div>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform opacity-0"
                  enterTo="transform opacity-100"
                  leave="transition duration-100 ease-out"
                  leaveFrom="transform opacity-100"
                  leaveTo="transform opacity-0"
                >
                  <Disclosure.Panel className="border-none">
                    <ul role="list" className="divide-y divide-gray-200">
                      {children}
                    </ul>
                  </Disclosure.Panel>
                </Transition>
              </div>
            )}
          </>
        )}
      </Disclosure>
    </div>
  );
};

export default ChecksSelectionGroup;
