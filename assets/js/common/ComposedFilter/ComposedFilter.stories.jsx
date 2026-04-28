import React, { useState } from 'react';
import { action } from 'storybook/actions';

import ComposedFilter from '.';

export default {
  title: 'Components/ComposedFilter',
  component: ComposedFilter,
  argTypes: {
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
    className: {
      type: 'string',
      description: 'Additional CSS classes applied to the filter container',
      control: { type: 'text' },
    },
    filters: {
      type: 'array',
      description:
        'Array of filter configuration objects defining the filters to compose',
      control: { type: 'object' },
    },
    resetValue: {
      type: 'object',
      description:
        'Object containing the default filter values used when reset is applied',
      control: { type: 'object' },
    },
    children: {
      type: 'element',
      description:
        'Additional React elements displayed after the filters when not in autoApply mode',
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

export const WithDateFilter = {
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
        type: 'date',
        title: 'Date',
        prefilled: true,
        options: [['My birthday', () => new Date(1986, 0, 24)]],
      },
    ],
    onChange: action('onChange'),
  },
};

export const WithSearchBox = {
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
        type: 'search_box',
        title: 'Search Query',
        placeholder: 'Search...',
      },
    ],
    onChange: action('onChange'),
  },
};
