import React, { useState } from 'react';

import { providers } from '@lib/model';
import ProviderLabel from '@common/ProviderLabel';

import Select, { createOptionRenderer } from '.';

export default {
  title: 'Components/Select',
  components: Select,
  argTypes: {
    optionsName: {
      type: 'string',
      description:
        'The name of the options to be used in the "All `optionsName`" option',
      control: {
        type: 'text',
      },
    },
    options: {
      type: 'array',
      description: 'The list of options to be rendered in the dropdown',
      control: {
        type: 'array',
      },
    },
    value: {
      type: 'string',
      description: 'The currently selected option',
      control: {
        type: 'text',
      },
    },
    renderOption: {
      description: 'A function to render each option in the dropdown',
      table: {
        type: { summary: '(item) => item' },
      },
    },
    onChange: {
      description: 'A function to be called when the selected option changes',
      table: {
        type: { summary: '() => {}' },
      },
    },
    className: {
      type: 'string',
      description: 'Extra classes to be applied to the component',
      control: {
        type: 'text',
      },
    },
    disabled: {
      type: 'boolean',
      description: 'Whether the Select is disabled or not',
      control: {
        type: 'boolean',
      },
    },
    args: {
      disabled: false,
    },
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);

    return <Select value={value} onChange={setValue} {...args} />;
  },
};

const options = ['foo', 'bar', 'baz', 'qux'];

export const Default = {
  args: {
    optionsName: 'optionz',
    options,
    value: 'bar',
  },
};

export const WithAllOption = {
  args: {
    ...Default.args,
    options: ['all', ...options],
  },
};

const optionsToLabel = {
  foo: '😁 Foo',
  bar: '😛 Bar',
  baz: '🤪 Baz',
  qux: '🧐 Qux',
};

const itemsOptionRenderer = createOptionRenderer('All Emojis!', (item) => (
  <span>{optionsToLabel[item]}</span>
));

export const WithCustomOptionRenderer = {
  args: {
    ...WithAllOption.args,
    renderOption: itemsOptionRenderer,
  },
};

const providerOptionRenderer = createOptionRenderer(
  'All providers',
  (provider) => <ProviderLabel provider={provider} />
);

export const ProviderSelectionSample = {
  args: {
    optionsName: 'providers',
    options: ['all', ...providers],
    value: 'all',
    renderOption: providerOptionRenderer,
  },
};

const structuredOptions = [
  'foo',
  { value: 'bar', disabled: true },
  'baz',
  'qux',
];

export const WithDisabledOption = {
  args: {
    optionsName: 'structured emojis',
    options: ['all', ...structuredOptions],
    value: 'baz',
    renderOption: itemsOptionRenderer,
  },
};

export const Disabled = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const WithSelectedItemPrefix = {
  args: {
    ...Default.args,
    selectedItemPrefix: '👉 ',
  },
};
