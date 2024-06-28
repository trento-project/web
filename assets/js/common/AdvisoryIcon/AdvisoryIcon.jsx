import React from 'react';
import { startCase } from 'lodash';
import {
  EOS_SHIELD_OUTLINED,
  EOS_CRITICAL_BUG_OUTLINED,
  EOS_QUESTION_MARK_FILLED,
  EOS_ADD_BOX_OUTLINED,
} from 'eos-icons-react';

import Tooltip from '@common/Tooltip';
import { computedIconCssClass } from '@lib/icon';

function Icon({ type, centered = false, hoverOpacity = true, size = 'l' }) {
  const hoverOpacityClassName = hoverOpacity
    ? 'hover:opacity-75'
    : 'hover:opacity-100';

  switch (type) {
    case 'security_advisory':
      return (
        <EOS_SHIELD_OUTLINED
          className={`${hoverOpacityClassName} ${computedIconCssClass(
            'fill-red-500',
            centered
          )} inline-block`}
          size={size}
        />
      );
    case 'bugfix':
      return (
        <EOS_CRITICAL_BUG_OUTLINED
          className={`${hoverOpacityClassName} ${computedIconCssClass(
            'fill-yellow-500',
            centered
          )} inline-block`}
          size={size}
        />
      );
    case 'enhancement':
      return (
        <EOS_ADD_BOX_OUTLINED
          className={`${hoverOpacityClassName} ${computedIconCssClass(
            'fill-yellow-500',
            centered
          )} inline-block`}
          size={size}
        />
      );
    default:
      return (
        <EOS_QUESTION_MARK_FILLED
          className={`${hoverOpacityClassName} ${computedIconCssClass(
            'fill-gray-500',
            centered
          )} inline-block`}
          size={size}
        />
      );
  }
}

export default function AdvisoryIcon({ type, centered, hoverOpacity, size }) {
  return (
    <Tooltip content={startCase(type || 'unknown')}>
      <Icon
        type={type}
        centered={centered}
        hoverOpacity={hoverOpacity}
        size={size}
      />
    </Tooltip>
  );
}
