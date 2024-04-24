import React from 'react';
import classNames from 'classnames';
import {
  // EOS_KEYBOARD_ARROW_RIGHT_FILLED,
  EOS_ERROR_OUTLINED,
} from 'eos-icons-react';

import Spinner from '@common/Spinner';
import Tooltip from '@common/Tooltip';

function Indicator({
  title,
  critical,
  tooltip,
  icon,
  loading,
  connectionError,
  children,
}) {
  const unknown = children === undefined;
  const error = unknown || connectionError;

  if (loading) {
    return (
      <div className="flex flex-row items-center border border-gray-200 p-2 rounded-md grow">
        <div className="px-2">{icon}</div>
        <div>
          <p className="font-bold">{title}</p>
          <div className="text-gray-500">
            <Spinner size="l" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tooltip isEnabled={unknown} content={tooltip} wrap={false}>
      <div className="flex flex-row items-center border border-gray-200 p-2 rounded-md grow">
        <div className="px-2">{icon}</div>
        <div>
          <p className="font-bold">{title}</p>
          <div
            className={classNames({
              'text-green-600': !error,
              'text-gray-600': error,
            })}
          >
            {critical && (
              <EOS_ERROR_OUTLINED
                size="l"
                className="inline align-bottom fill-red-500"
              />
            )}{' '}
            {error ? (
              <div>
                <EOS_ERROR_OUTLINED size="l" className="inline align-bottom" />{' '}
                {connectionError ? 'SUSE Manager connection failed' : 'Unknown'}
              </div>
            ) : (
              children
            )}
          </div>
        </div>
        <div className="flex grow justify-end">
          {/* {!unknown && (
            <div>
              <EOS_KEYBOARD_ARROW_RIGHT_FILLED
                size="l"
                className="fill-gray-400"
              />
            </div>
          )} */}
        </div>
      </div>
    </Tooltip>
  );
}

export default Indicator;
