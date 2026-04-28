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
    value: {
      description:
        'Control value. Used to change select value after it is mounted',
      control: {
        type: 'object',
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
    components: {
      description: "Custom React Select component replacements for rendering Option, DropdownIndicator, ClearIndicator, and other select parts"
    },
    selectClassNames: {
      description: "Custom className generator functions for styling Select components"
    },
    unstyled: {
      description: "Whether to use unstyled react-select components and handle all styling externally"
    },
    renderControlOption: {
      description: "Custom renderer function for displaying the selected option in the control"
    },
    filterOption: {
      description: "Custom filter function to determine which options match the search input"
    },
    className: {
      description: "Additional CSS classes to apply to the Select container wrapper"
    }
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
