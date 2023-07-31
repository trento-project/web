import React from 'react';

import { TooltipNext } from '.';
import { PLACES } from './Tooltip';

export default {
  title: 'Tooltip',
  component: TooltipNext,
  argTypes: {
    content: {
      type: 'string',
      description: 'Content to be rendered int he tooltip',
      options: PLACES,
      control: { type: 'text' },
    },
    place: {
      type: 'string',
      description: 'Position of the tooltip',
      options: PLACES,
      control: { type: 'radio' },
    },
    offset: {
      type: 'number',
      description: 'Space between the tooltip and the anchor',
      control: { type: 'number' },
    },
    isEnabled: {
      type: 'boolean',
      description: 'Whether the tooltip is enabled',
      control: { type: 'boolean' },
    },
    isOpen: {
      type: 'boolean',
      description: 'Whether the tooltip should be open',
      control: { type: 'boolean' },
    },
  },
  render: (args) => (
    <div className="p-12 flex items-center justify-center">
      <TooltipNext {...args}>
        <div className="bg-sky-400 p-2 text-white font-semibold rounded">
          Hover me!
        </div>
      </TooltipNext>
    </div>
  ),
};

export const Default = {
  args: {
    content: 'Hello World',
  },
};

export const Positioning = {
  args: {
    ...Default.args,
    isOpen: true,
  },
};

export const WithOffset = {
  args: {
    ...Default.args,
    isOpen: true,
    offset: -1,
  },
};
