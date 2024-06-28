import React from 'react';
import classNames from 'classnames';
import {
  EOS_KEYBOARD_ARROW_RIGHT_FILLED,
  EOS_ERROR_OUTLINED,
} from 'eos-icons-react';

import Tooltip from '@common/Tooltip';

function Indicator({
  title,
  critical,
  tooltip,
  icon,
  loading,
  children,
  onNavigate,
}) {
  const unknown = children === undefined;

  if (loading) {
    return (
      <div className="flex flex-row items-center border border-gray-200 p-2 rounded-md grow">
        <div className="px-2">{icon}</div>
        <div>
          <p className="font-bold">{title}</p>
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Tooltip isEnabled={unknown} content={tooltip} wrap={false}>
      <div
        role="button"
        tabIndex={0}
        className={classNames(
          'flex flex-row items-center border border-gray-200 p-2 rounded-md grow',
          { 'cursor-pointer': !unknown }
        )}
        onClick={onNavigate}
        onKeyDown={({ code }) => {
          if (code === 'Enter') {
            onNavigate();
          }
        }}
      >
        <div className="px-2">{icon}</div>
        <div>
          <p className="font-bold">{title}</p>
          <div
            className={classNames({
              'text-green-600': !unknown,
              'text-gray-600': unknown,
            })}
          >
            {critical || unknown ? (
              <div>
                <EOS_ERROR_OUTLINED
                  size="l"
                  className={`inline align-bottom${
                    critical && ' fill-red-500'
                  }`}
                />{' '}
                {critical && children ? children : 'Unknown'}
              </div>
            ) : (
              children
            )}
          </div>
        </div>
        <div className="flex grow justify-end">
          {!unknown && (
            <div>
              <EOS_KEYBOARD_ARROW_RIGHT_FILLED
                size="l"
                className="fill-gray-400"
              />
            </div>
          )}
        </div>
      </div>
    </Tooltip>
  );
}

export default Indicator;
