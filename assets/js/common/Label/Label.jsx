import React from 'react';
import classNames from 'classnames';
import { EOS_INFO_OUTLINED } from 'eos-icons-react';

import Tooltip from '@common/Tooltip';

function Label({ className, children, info, required = false, ...props }) {
  return (
    <label className={classNames('font-bold', className)} {...props}>
      {children}

      {required && <span className="text-red-500">*</span>}

      {info && (
        <Tooltip zIndex="50" content={info}>
          <span className="ml-1">
            <EOS_INFO_OUTLINED className="inline align-sub" />
          </span>
        </Tooltip>
      )}
    </label>
  );
}

export default Label;
