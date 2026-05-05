import React, { useState } from 'react';
import { action } from 'storybook/actions';

import DateFilter from './DateFilter';

export default {
  title: 'Components/DateFilter',
  component: DateFilter,
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
    prefilled: {
      description:
        'Whether to include preconfigured date filter options in the list',
      control: { type: 'boolean' },
    },
    className: {
      description: 'CSS classes to apply to the date filter container',
      control: { type: 'text' },
    },
    timezone: {
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
    },
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);

    return (
      <DateFilter
        title={args.title}
        options={args.options}
        value={value}
        prefilled={args.prefilled}
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
    title: 'by date',
    options: [['1h ago', () => new Date(Date.now() - 60 * 60 * 1000)]],
    type: 'date',
  },
};

export const WithSelectedValue = {
  args: {
    ...Default.args,
    value: '1h ago',
  },
};

export const WithCustomDateValue = {
  args: {
    ...Default.args,
    value: ['custom', new Date()],
  },
};

export const WithCustomOptions = {
  args: {
    ...Default.args,
    options: [['2h ago', () => new Date(Date.now() - 2 * 60 * 60 * 1000)]],
  },
};

export const WithOverriddenOptions = {
  args: {
    ...Default.args,
    options: [
      [
        '30d ago',
        () => {
          const now = new Date();
          return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        },
        () => 'One month ago',
      ],
    ],
  },
};

export const WithPickedOptionsOnly = {
  args: {
    ...Default.args,
    prefilled: false,
    options: ['1h ago', '30d ago'],
  },
};

export const WithCustomRenderer = {
  args: {
    ...Default.args,
    prefilled: false,
    options: [['epoch', () => new Date(0), () => '⌛ Beginning of time']],
  },
};
