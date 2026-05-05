import React, { useState } from 'react';
import { action } from 'storybook/actions';

import Filter from './Filter';

export default {
  title: 'Components/Filter',
  component: Filter,
  argTypes: {
    options: {
      description: 'List of options available',
      control: { type: 'object' },
    },
    title: {
      type: { name: 'string', required: true },
      description:
        'Title of the filter, will appear as placeholder when no value is selected',
      control: { type: 'text' },
    },
    value: {
      type: { name: 'array', required: false, defaultValue: [] },
      description: 'Selected options',
      control: { type: 'object' },
    },
    onChange: {
      description: 'Function to call when the selected options change',
      action: 'onChange',
    },
    className: {
      description:
        'Additional CSS classes to apply to the root filter container',
      control: { type: 'text' },
    },
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);

    return (
      <Filter
        {...args}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          action('onChange')(newValue);
        }}
      />
    );
  },
};

export const Default = {
  args: {
    title: 'Title',
    type: 'select',
    options: [
      'Tony Kekw',
      'Chad Carbonara',
      'Chuck Amatriciana',
      'K.C.O. Pepe',
      'Virginia Gricia',
    ],
    value: [],
  },
};

export const WithValue = {
  args: {
    ...Default.args,
    value: ['Tony Kekw'],
  },
};

export const WithMultipleValues = {
  args: {
    ...Default.args,
    value: ['Tony Kekw', 'Chad Carbonara'],
  },
};

export const WithLabel = {
  args: {
    ...Default.args,
    options: [
      ['tony-kekw', 'Tony Kekw'],
      ['chad-carbonara', 'Chad Carbonara'],
      ['chuck-amatriciana', 'Chuck Amatriciana'],
      ['kco-pepe', 'K.C.O. Pepe'],
      ['virginia-gricia', 'Virginia Gricia'],
    ],
    value: ['tony-kekw'],
  },
};

export const WithLargeOptionContent = {
  args: {
    ...Default.args,
    options: [
      'Tony Kekw',
      'Chad Carbonara',
      'Chuck Amatriciana',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    ],
  },
};
