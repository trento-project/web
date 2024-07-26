import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';

import Filter from '.';

export default {
  title: 'Components/Filter',
  component: Filter,
  argTypes: {
    options: {
      type: { name: 'array', required: true },
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
      type: { name: 'function', required: false },
      description: 'Function to call when the selected options change',
      control: { type: null },
    },
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);

    return (
      <Filter
        title={args.title}
        options={args.options}
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
