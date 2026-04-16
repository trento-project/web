import React from 'react';
import Select, { createOptionRenderer } from '.';

import { providers } from '@lib/model';
import ProviderLabel from '@common/ProviderLabel';

export default {
  title: 'Components/Select',
  component: Select,
  argTypes: {
    options: {
      type: 'array',
      description: 'The list of options to be rendered in the dropdown',
      control: {
        type: 'array',
      },
    },
    initialValues: {
      type: 'array',
      description:
        'Initially selected values. Used only to prepopulate the select on mount',
      control: {
        type: 'array',
      },
    },
    isDisabled: {
      type: 'boolean',
      description: 'Component is disabled or not',
      control: {
        type: 'boolean',
      },
    },
    isMulti: {
      type: 'boolean',
      description: 'Component is multi value',
      control: {
        type: 'boolean',
      },
    },
    isSearchable: {
      type: 'boolean',
      description: 'Component is searchable',
      control: {
        type: 'boolean',
      },
    },
    isClearable: {
      type: 'boolean',
      description: 'Component selected options are clearable',
      control: {
        type: 'boolean',
      },
    },
    renderOption: {
      description: 'A function to render each option in the dropdown',
      table: {
        type: { summary: '(item) => item' },
      },
    },
    onChange: {
      description: 'A function to be called when selected options are changed',
      table: {
        type: { summary: '() => {}' },
      },
    },
  },
};

const options = [
  { value: 1, label: 'orange' },
  { value: 2, label: 'apple' },
  { value: 3, label: 'banana' },
];

const optionsWithTooltip = [
  { value: 1, label: 'orange', tooltip: 'A nice orange' },
  { value: 2, label: 'apple', tooltip: 'A nice apple' },
  { value: 3, label: 'banana', tooltip: 'A nice banana' },
];

export const Default = {
  args: {
    options,
    className: 'w-96',
  },
};

export const WithAllOption = {
  args: {
    ...Default.args,
    options: ['all', ...options],
  },
};

export const WithTooltip = {
  args: {
    ...Default.args,
    options: optionsWithTooltip,
  },
};

export const WithInitialValues = {
  args: {
    ...Default.args,
    initialValues: [options[0]],
  },
};

const optionsToLabel = {
  orange: '😁 Foo',
  apple: '😛 Bar',
  banana: '🤪 Baz',
};

const itemsOptionRenderer = createOptionRenderer('All Emojis!', (item) => (
  <span>{optionsToLabel[item]}</span>
));

export const WithCustomOptionRenderer = {
  args: {
    ...Default.args,
    renderOption: itemsOptionRenderer,
  },
};

const providerOptionRenderer = createOptionRenderer(
  'All providers',
  (provider) => <ProviderLabel provider={provider} />
);

export const ProviderSelectionSample = {
  args: {
    ...Default.args,
    options: ['all', ...providers],
    initialValues: ['all'],
    renderOption: providerOptionRenderer,
  },
};

export const Disabled = {
  args: {
    ...WithInitialValues.args,
    isDisabled: true,
  },
};

const disabledOptions = [
  'foo',
  { label: 'bar', value: 'bar', isDisabled: true },
  'baz',
  'qux',
];

export const WithDisabledOption = {
  args: {
    ...Default.args,
    options: ['all', ...disabledOptions],
  },
};

export const Multi = {
  args: {
    ...Default.args,
    isMulti: true,
  },
};

export const Searchable = {
  args: {
    ...Default.args,
    isSearchable: true,
  },
};

export const Clearable = {
  args: {
    ...Multi.args,
    isClearable: true,
  },
};
