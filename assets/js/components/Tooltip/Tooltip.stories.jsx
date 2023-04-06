import React from 'react';

import Tooltip from '.';

export default {
  title: 'Tooltip',
  component: Tooltip,
  args: {
    tooltipText: 'Hello World',
    width: 'w-full',
  },
};

export function Default(args) {
  return (
    <div className="p-12">
      <div className="relative">
        <Tooltip {...args}>Hover me!</Tooltip>
      </div>
    </div>
  );
}
