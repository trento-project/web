import React, { useRef, Fragment } from 'react';
import classNames from 'classnames';
import { some } from 'lodash';
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  MenuSeparator,
} from '@headlessui/react';
import { EOS_MORE_VERT, EOS_LOADING_ANIMATED } from 'eos-icons-react';

import Button from '@common/Button';

function ActionsButton({ actions }) {
  const ref = useRef(null);
  const someRunning = some(actions, { running: true });

  return (
    <Menu>
      <MenuButton as={Fragment}>
        <div className="flex" ref={ref}>
          <Button
            type="primary-white"
            className="inline-block mx-0.5 border-green-500 border"
            size="small"
          >
            <EOS_MORE_VERT className="inline-block fill-jungle-green-500" />{' '}
            Actions
          </Button>
        </div>
      </MenuButton>
      <MenuItems
        anchor={{ to: 'bottom start', gap: '5px' }}
        as="div"
        className="w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 px-3 py-3 focus:outline-none"
      >
        {actions.map(({ value, running, disabled, onClick }) => (
          <Fragment key={value}>
            <MenuItem>
              <button
                type="button"
                onClick={onClick}
                className={classNames(
                  'w-full rounded-md text-left block px-4 py-2 text-sm',
                  {
                    'text-gray-700 hover:bg-gray-100':
                      !disabled && !someRunning,
                  },
                  { 'text-gray-400': disabled || someRunning }
                )}
                disabled={disabled || someRunning}
              >
                {running && (
                  <EOS_LOADING_ANIMATED className="inline-block fill-jungle-green-500 mr-1" />
                )}
                {value}
              </button>
            </MenuItem>
            <MenuSeparator className="my-1" />
          </Fragment>
        ))}
      </MenuItems>
    </Menu>
  );
}

export default ActionsButton;
