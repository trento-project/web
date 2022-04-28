import React from 'react';
import classNames from 'classnames';

import { EOS_SCHEDULE, EOS_LOADING_ANIMATED } from 'eos-icons-react';

import HealthIcon from '@components/Health';

export const ExecutionIcon = ({
  health,
  execution_state,
  centered = false,
}) => {
  const computedCssClass = (fillColor, centered) => {
    return classNames(fillColor, { 'mx-auto': centered });
  };

  switch (execution_state) {
    case 'requested':
      return (
        <EOS_SCHEDULE className={computedCssClass('fill-gray-500', centered)} />
      );
    case 'running':
      return (
        <EOS_LOADING_ANIMATED
          className={computedCssClass('fill-jungle-green-500', centered)}
        />
      );
  }

  return <HealthIcon health={health} centered={centered} />;
};
