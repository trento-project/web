import React from 'react';
import classNames from 'classnames';

import Pill from '@common/Pill';

const replicationStatuses = {
  Unknown: 'bg-gray-100 text-gray-800',
  Primary: 'bg-green-100 text-green-800',
  Secondary: 'bg-green-100 text-green-800',
  Failed: 'bg-red-100 text-red-800',
};

function ReplicationStatusPill({ status = 'Unknown' }) {
  return (
    <Pill
      size="xs"
      className={classNames(
        'uppercase flex items-center relative',
        replicationStatuses[status]
      )}
    >
      {status}
    </Pill>
  );
}

export default ReplicationStatusPill;
