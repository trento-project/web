import React from 'react';

import Tooltip from '.';

export default {
  title: 'Tooltip',
  component: Tooltip,
  args: {
    tooltipText: "Hello World",
    width: "w-full"
  },
};

export function Default(args) {
    return <div class="p-12">
        <div class="relative">
            <Tooltip {...args}>Hover me!</Tooltip>
            </div>
        </div>;
  }