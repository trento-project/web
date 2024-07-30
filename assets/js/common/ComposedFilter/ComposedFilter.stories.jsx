import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';

import ComposedFilter from '.';

export default {
  title: 'Components/ComposedFilter',
  component: ComposedFilter,
  argTypes: {
    options: {
      type: { name: 'array', required: true, defaultValue: [] },
      description:
        'Describe the list of filters to be composed. Filters are displayed in order.',
      control: { type: 'object' },
    },
    value: {
      type: { name: 'object', required: false, defaultValue: {} },
      description:
        'Key/value pairs of selected filters, where key is the filter id',
      control: { type: 'object' },
    },
    onChange: {
      type: { name: 'function', required: false },
      description:
        'Function to call when the composed value changes. If autoApply is true, this function is called on every filter change',
      control: { type: null },
    },
    autoApply: {
      type: { name: 'boolean', required: false, defaultValue: false },
      description:
        'If true, onChange is called on every filter change; otherwise, an apply button is shown',
      control: { type: 'boolean' },
    },
  },
  render: ({ filters, value, onChange, autoApply }) => {
    const [v, setValue] = useState(value);

    return (
      <ComposedFilter
        filters={filters}
        value={v}
        onChange={(newValue) => {
          setValue(newValue);
          onChange(newValue);
        }}
        autoApply={autoApply}
      />
    );
  },
};

export const Default = {
  args: {
    filters: [
      {
        key: 'filter1',
        type: 'select',
        title: 'Pasta',
        options: ['Carbonara', 'Amatriciana', 'Ajo & Ojo', 'Gricia'],
      },
      {
        key: 'filter2',
        type: 'select',
        title: 'Pizza',
        options: ['Margherita', 'Marinara', 'Diavola', 'Capricciosa'],
      },
    ],
    onChange: action('onChange'),
  },
};
