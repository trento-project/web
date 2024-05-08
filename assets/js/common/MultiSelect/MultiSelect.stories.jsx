import MultiSelect from '.';

export default {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  argTypes: {
    options: {
      type: 'array',
      description: 'The list of options to be rendered in the dropdown',
      control: {
        type: 'array',
      },
    },
    values: {
      type: 'array',
      description: 'Initially selected values',
      control: {
        type: 'array',
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

export const WithTooltip = {
  args: {
    ...Default.args,
    options: optionsWithTooltip,
  },
};

export const WithInitialValues = {
  args: {
    ...Default.args,
    values: options[0],
  },
};
