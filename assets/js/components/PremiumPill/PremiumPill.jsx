import React from 'react';
import classNames from 'classnames';

import Pill from '@components/Pill';

function PremiumPill({ className }) {
  return (
    <Pill
      className={classNames(className, 'bg-green-100 text-green-800')}
      size="xs"
    >
      Premium
    </Pill>
  );
}

export default PremiumPill;
