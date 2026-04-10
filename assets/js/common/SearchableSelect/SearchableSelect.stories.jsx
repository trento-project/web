import SearchableSelect from '.';

export default {
  title: 'Components/SearchableSelect',
  component: SearchableSelect,
  argTypes: {
    options: {
      type: 'array',
      description: 'The list of options to render',
      control: {
        type: 'array',
      },
    },
    value: {
      type: 'string',
      description: 'Selected option value',
      control: {
        type: 'text',
      },
    },
    disabled: {
      type: 'boolean',
      description: 'Component is disabled or not',
      control: {
        type: 'boolean',
      },
    },
    isClearable: {
      type: 'boolean',
      description: 'Enable clear action',
      control: {
        type: 'boolean',
      },
    },
    onChange: {
      description: 'A function to be called when selected option changes',
      table: {
        type: { summary: '(value) => {}' },
      },
    },
  },
};

const options = [
  {
    value: 'Europe/Berlin',
    label: 'Europe/Berlin (GMT+1)',
    searchLabel: 'Europe/Berlin',
  },
  {
    value: 'America/New_York',
    label: 'America/New_York (GMT-5)',
    searchLabel: 'America/New_York',
  },
  {
    value: 'Asia/Tokyo',
    label: 'Asia/Tokyo (GMT+9)',
    searchLabel: 'Asia/Tokyo',
  },
];

export const Default = {
  args: {
    options,
    className: 'w-96',
    placeholder: 'Select timezone...',
    noOptionsMessage: () => 'No options found',
  },
};

export const WithValue = {
  args: {
    ...Default.args,
    value: 'Europe/Berlin',
  },
};

export const Clearable = {
  args: {
    ...WithValue.args,
    isClearable: true,
  },
};

export const Disabled = {
  args: {
    ...WithValue.args,
    disabled: true,
  },
};
