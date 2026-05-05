import React from 'react';
import { BrowserRouter } from 'react-router';
import HostLink from '.';

export default {
  title: 'Components/HostLink',
  component: HostLink,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    hostId: {
      description: 'Unique identifier for the host',
      control: { type: 'text' },
    },
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    hostId: 'host-123',
    children: 'Default children',
  },
};
