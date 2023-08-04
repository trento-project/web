import React from 'react';

import Tooltip from '.';
import { PLACES } from './Tooltip';

export default {
  title: 'Tooltip',
  component: Tooltip,
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
    isEnabled: {
      type: 'boolean',
      description: 'Whether the tooltip is enabled',
      control: { type: 'boolean' },
    },
  },
  render: (args) => (
    <div className="p-12 flex items-center justify-center">
      <Tooltip {...args}>
        <div className="bg-sky-400 p-2 text-white font-semibold rounded">
          Hover me!
        </div>
      </Tooltip>
    </div>
  ),
};

export const Default = {
  args: {
    content: 'Hello World',
  },
};

export const Positioning = {
  render: (args) => (
    <div className="mt-20 grid grid-rows-4 grid-flow-col gap-20 justify-items-center">
      {PLACES.map((place) => (
        <div>
          <Tooltip place={place} content={place} {...args}>
            <div className="bg-sky-400 p-2 text-white font-semibold rounded">
              Hover me
            </div>
          </Tooltip>
        </div>
      ))}
    </div>
  ),
};
