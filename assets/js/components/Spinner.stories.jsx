import Spinner from './Spinner';

export default {
  title: 'Spinner',
  component: Spinner,
};

export const Default = {
  argTypes: {
    className: {
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
  },
};
