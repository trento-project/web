import Label from './Label';

export default {
  title: 'Components/Label',
  component: Label,
  argTypes: {
    children: {
      description: 'Label content',
      control: {
        type: 'string',
      },
    },
    className: {
      description: 'CSS classes',
      control: {
        type: 'string',
      },
    },
    info: {
      description: 'Tooltip for user education',
      control: {
        type: 'string',
      },
    },
    required: {
      description: 'Wether this field is required or not',
      control: {
        type: 'boolean',
      },
    },
  },
};

export const Default = {
  args: {
    children: 'This is a label',
  },
};

export const Required = {
  args: {
    children: 'This is a label',
    required: true,
  },
};

export const WithInfo = {
  args: {
    children: 'This is a label',
    info: 'This is a tooltip for user education',
  },
};

export const WithInfoRequired = {
  args: {
    children: 'This is a label',
    info: 'This is a tooltip for user education',
    required: true,
  },
};
