import React from 'react';
import HealthIcon from '@components/Health/HealthIcon';
import Tooltip from '@components/Tooltip';

import Pill from '.';

export default {
  title: 'Pill',
  component: Pill,
};

export function Small() {
  return <Pill size="sm">Small!</Pill>;
}

export function ExtraSmall() {
  return <Pill size="xs">Extra small!</Pill>;
}

export function WithIcon() {
  return (
    <Pill className="bg-green-100 text-green-800 group flex items-center">
      <HealthIcon size="base" health="passing" />
      <span className="ml-1">Nice!</span>
    </Pill>
  );
}

export function Warning() {
  return <Pill className="bg-yellow-200 text-yellow-600">Warning!</Pill>;
}

export function Critical() {
  return <Pill className="bg-red-200 text-red-600">Critical!</Pill>;
}

export function Truncated() {
  return (
    <Pill
      display="inline-block"
      className="bg-green-100 text-green-800 truncate w-24"
    >
      Truncated pill text
    </Pill>
  );
}

export function WithTooltip() {
  return (
    <Pill className="bg-green-100 text-green-800 relative">
      With tooltip!
      <Tooltip tooltipText="Oh yeah!" />
    </Pill>
  );
}
