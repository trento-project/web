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
import DisabledGuard from '@common/DisabledGuard';

// The custom component is required to wrap in the DisabledGuard component
// and pass the disabled value to the child
function CustomMenuButton({ value, running, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      className={classNames(
        'w-full rounded-md text-left block px-4 py-2 text-sm',
        {
          'text-gray-700 hover:bg-gray-100': !disabled,
        },
        { 'text-gray-400': disabled }
      )}
      disabled={disabled}
    >
      {running && (
        <EOS_LOADING_ANIMATED className="inline-block fill-jungle-green-500 mr-1" />
      )}
      {value}
    </button>
  );
}

function OperationsButton({
  operations,
  userAbilities,
  menuPosition = 'bottom start',
}) {
  const ref = useRef(null);
  const someRunning = some(operations, { running: true });

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
            Operations
          </Button>
        </div>
      </MenuButton>
      <MenuItems
        anchor={{ to: menuPosition, gap: '5px' }}
        as="div"
        className="w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 px-3 py-3 focus:outline-none"
      >
        {operations.map(({ value, running, disabled, permitted, onClick }) => (
          <Fragment key={value}>
            <MenuItem>
              <DisabledGuard
                userAbilities={userAbilities}
                permitted={permitted}
                tooltipWrap
              >
                <CustomMenuButton
                  value={value}
                  running={running}
                  disabled={disabled || someRunning}
                  onClick={onClick}
                />
              </DisabledGuard>
            </MenuItem>

            <MenuSeparator className="my-1" />
          </Fragment>
        ))}
      </MenuItems>
    </Menu>
  );
}

export default OperationsButton;
