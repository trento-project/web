import React from 'react';

import classNames from 'classnames';

import { Switch } from '@headlessui/react';

import Accordion from '@components/Accordion';

export const NONE_CHECKED = 'none';
export const SOME_CHECKED = 'some';
export const ALL_CHECKED = 'all';

const switchClasses = {
  [NONE_CHECKED]: 'bg-gray-200',
  [SOME_CHECKED]: 'bg-green-300',
  [ALL_CHECKED]: 'bg-jungle-green-500',
};

const translateClasses = {
  [NONE_CHECKED]: 'translate-x-0',
  [SOME_CHECKED]: 'translate-x-2.5',
  [ALL_CHECKED]: 'translate-x-5',
};

export const allSelected = (selectedState) => selectedState === ALL_CHECKED;

function ChecksSelectionGroup({
  children,
  group,
  selected = NONE_CHECKED,
  onChange = () => {},
}) {
  return (
    <Accordion
      className="mb-1"
      withTransition
      headerClassnames="hover:bg-gray-100"
      header={
        <div className="flex">
          <Switch.Group as="div" className="flex items-center pl-2">
            <Switch
              checked={allSelected(selected)}
              className={classNames(
                switchClasses[selected],
                'tn-check-switch relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer focus:outline-none transition-colors ease-in-out duration-200'
              )}
              onChange={onChange}
            >
              <span
                aria-hidden="true"
                className={classNames(
                  translateClasses[selected],
                  'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                )}
              />
            </Switch>
          </Switch.Group>
          <h3 className="tn-check-switch text-lg leading-6 font-medium text-gray-900 self-center p-6">
            {group}
          </h3>
        </div>
      }
    >
      <ul
        data-testid="check-selection-panel"
        className="divide-y divide-gray-200"
      >
        {children}
      </ul>
    </Accordion>
  );
}

export default ChecksSelectionGroup;
