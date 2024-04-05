import React from 'react';
import classNames from 'classnames';
import {
  // EOS_KEYBOARD_ARROW_RIGHT_FILLED,
  EOS_ERROR_OUTLINED,
  EOS_LOADING_ANIMATED,
} from 'eos-icons-react';

import Tooltip from '@common/Tooltip';

function Indicator({ title, critical, tooltip, icon, loading, children }) {
  const unknown = !children;

  if (loading) {
    return (
      <div className="flex flex-row items-center border border-gray-200 p-2 rounded-md grow">
        <div className="px-2">{icon}</div>
        <div>
          <p className="font-bold">{title}</p>
          <div className="text-gray-500">
            <div>
              <EOS_LOADING_ANIMATED
                size="l"
                className="inline align-bottom fill-gray-400"
              />
              Loading...
            </div>
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
              'text-green-600': !unknown,
              'text-gray-600': unknown,
            })}
          >
            {critical && (
              <EOS_ERROR_OUTLINED
                size="l"
                className="inline align-bottom fill-red-500"
              />
            )}{' '}
            {children || (
              <div>
                <EOS_ERROR_OUTLINED size="l" className="inline align-bottom" />{' '}
                Unknown
              </div>
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
