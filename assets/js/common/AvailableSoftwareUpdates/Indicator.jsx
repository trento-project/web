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
  message,
  icon,
  isError,
  onNavigate,
}) {
  const clickHandler = isError ? () => {} : onNavigate;

  return (
    <Tooltip isEnabled={isError && tooltip} content={tooltip} wrap={false}>
      <div
        role="button"
        tabIndex={0}
        className={classNames(
          'flex flex-row items-center border border-gray-200 p-2 rounded-md grow',
          { 'cursor-default': isError }
        )}
        onClick={clickHandler}
        onKeyDown={({ code }) => {
          if (code === 'Enter') {
            clickHandler();
          }
        }}
      >
        <div className="px-2">{icon}</div>
        <div>
          <p className="font-bold">{title}</p>
          <div
            className={classNames({
              'text-green-600': !isError,
              'text-gray-600': isError,
            })}
          >
            {critical || isError ? (
              <div>
                <EOS_ERROR_OUTLINED
                  size="l"
                  className={`inline align-bottom${
                    critical && ' fill-red-500'
                  }`}
                />{' '}
                {message}
              </div>
            ) : (
              message
            )}
          </div>
        </div>
        <div className="flex grow justify-end">
          {!isError && (
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
