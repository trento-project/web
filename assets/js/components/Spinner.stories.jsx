import Spinner from './Spinner';

export default {
  title: 'Spinner',
  component: Spinner,
};

export const Default = {
  argTypes: {
    centered: {
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    wrapperClassName: {
      control: 'text',
      description: 'Add padding or margin',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '""' },
      },
    },
    size: {
      control: { type: 'radio' },
      options: ['xs', 's', 'base', 'm', 'l', 'xl', 'xxl', 'xxxl'],
      description: 'How big should be the spinner?',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'm' },
      },
    },
    spinnerColor: {
      description: 'Set tailwind fill color',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};
