import React, { useState } from 'react';

import { PROVIDERS } from '@lib/model';
import ProviderLabel from '@components/ProviderLabel';
import Select from './Select';

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
    optionRenderer: {
      description: 'A function to render each option in the dropdown',
      table: {
        type: { summary: '(item) => item' },
      },
    },
    withAllOption: {
      description:
        'Whether the dropdown should have an "All `optionsName`" option',
      control: {
        type: 'boolean',
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
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);

    return <Select value={value} onChange={setValue} {...args} />;
  },
};

const emojiOptions = ['foo', 'bar', 'baz', 'qux'];

const emojiOptionsToLabel = {
  foo: '😁 Foo',
  bar: '😛 Bar',
  baz: '🤪 Baz',
  qux: '🧐 Qux',
};
const itemsOptionRenderer = (item) => <span>{emojiOptionsToLabel[item]}</span>;

export const Default = {
  args: {
    optionsName: 'emojis',
    options: emojiOptions,
    value: 'bar',
    optionRenderer: itemsOptionRenderer,
  },
};

const providerOptionRenderer = (provider) => (
  <ProviderLabel provider={provider} />
);

export const WithAllOption = {
  args: {
    optionsName: 'providers',
    options: PROVIDERS,
    value: 'all',
    withAllOption: true,
    optionRenderer: providerOptionRenderer,
  },
};
