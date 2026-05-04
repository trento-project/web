import Spinner from './Spinner';

export default {
  title: 'Components/Spinner',
  component: Spinner,
  argTypes: {
    className: {
      control: { type: 'text' },
      description: 'Add padding or margin',
      table: {
        type: { summary: 'string' },
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

export const Default = {
  args: { size: 'm', className: '' },
};
