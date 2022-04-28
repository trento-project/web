import React from 'react';
import { computedIconCssClass } from '@lib/icon';

import { EOS_SCHEDULE } from 'eos-icons-react';

import HealthIcon from '@components/Health';
import Spinner from '@components/Spinner';

export const ExecutionIcon = ({ health, executionState, centered = false }) => {
  switch (executionState) {
    case 'requested':
      return (
        <EOS_SCHEDULE
          className={computedIconCssClass('fill-gray-500', centered)}
        />
      );
    case 'running':
      return <Spinner />;
  }

  return <HealthIcon health={health} centered={centered} />;
};
