import React from 'react';
import { EOS_WARNING_OUTLINED } from 'eos-icons-react';

import Tooltip from '@common/Tooltip';
import { Link } from 'react-router';

function SapSystemLink({ systemType, sapSystemId, children }) {
  return sapSystemId && systemType ? (
    <Link
      className="text-jungle-green-500 hover:opacity-75"
      to={`/${systemType}/${sapSystemId}`}
    >
      {children}
    </Link>
  ) : (
    <Tooltip content="System currently not registered." place="bottom">
      <span className="group flex items-center relative">
        <EOS_WARNING_OUTLINED
          size="base"
          className="centered fill-yellow-500"
        />
        <span className="ml-1 truncate max-w-[100px]">{children}</span>
      </span>
    </Tooltip>
  );
}

export default SapSystemLink;
