import React from 'react';
import { MemoryRouter } from 'react-router';
import Component from './ChecksResultFilters';

import { action } from 'storybook/actions';
export default {
  title: 'Components/ChecksResultFilters',
  component: Component,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    savedFilters: {
      description: 'Array of saved filters',
      control: { type: 'object' },
    },
    onChange: {
      description: 'Callback function invoked when change',
      action: 'onChange',
    },
    onSave: {
      description: 'Callback function invoked when save',
      action: 'onSave',
    },
  },
};

export const Default = {
  args: {
    savedFilters: [],
    onChange: action('onChange'),
    onSave: action('onSave'),
  },
};
