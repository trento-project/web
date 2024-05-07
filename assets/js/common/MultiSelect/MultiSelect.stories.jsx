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
  { value: 1, label: 'Orange' },
  { value: 2, label: 'Apple' },
  { value: 3, label: 'Banana' },
];

const optionsWithTooltip = [
  { value: 1, label: 'Orange', tooltip: 'A nice orange' },
  { value: 2, label: 'Apple', tooltip: 'A nice apple' },
  { value: 3, label: 'Banana', tooltip: 'A nice banana' },
];

export const Default = {
  args: {
    options,
  },
};

export const WithTooltip = {
  args: {
    options: optionsWithTooltip,
  },
};

export const WithInitialValues = {
  args: {
    ...Default.args,
    values: options[0],
  },
};
