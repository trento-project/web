import React from 'react';
import classNames from 'classnames';

import {
  EOS_CHECK_CIRCLE_OUTLINED,
  EOS_ERROR_OUTLINED,
  EOS_INFO_OUTLINED,
  EOS_WARNING_OUTLINED,
} from 'eos-icons-react';

const INFO = 'info';
const SUCCESS = 'success';
const WARNING = 'warning';
const ERROR = 'error';

const iconMap = {
  [INFO]: <EOS_INFO_OUTLINED className="fill-gray-500" />,
  [SUCCESS]: <EOS_CHECK_CIRCLE_OUTLINED className="fill-green-500" />,
  [WARNING]: <EOS_WARNING_OUTLINED className="fill-yellow-500" />,
  [ERROR]: <EOS_ERROR_OUTLINED className="fill-red-500" />,
};

function Banner({ type = INFO, children }) {
  return (
    <div
      className={classNames('rounded-lg mt-2 mb-2 p-3 border-2', {
        'bg-gray-50 border-gray-500': type === INFO,
        'bg-green-50 border-green-500': type === SUCCESS,
        'bg-yellow-50 border-yellow-500': type === WARNING,
        'bg-red-50 border-red-500': type === ERROR,
      })}
    >
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex w-0 flex-1 items-center">
          {iconMap[type]}
          <p className="ml-3 truncate font-medium">
            <span
              data-testid="banner"
              className={classNames('md:inline', {
                'text-gray-500': type === INFO,
                'text-green-500': type === SUCCESS,
                'text-yellow-500': type === WARNING,
                'text-red-500': type === ERROR,
              })}
            >
              {children}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Banner;
