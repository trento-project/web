import Spinner from './Spinner';

export default {
  title: 'Components/Spinner',
  component: Spinner,
  argTypes: {
    className: {
      control: { type: 'text' },
      description: 'Add padding or margin',
    },
    size: {
      control: { type: 'radio' },
      options: ['xs', 's', 'base', 'm', 'l', 'xl', 'xxl', 'xxxl'],
      description: 'How big should be the spinner?',
    },
  },
};

export const Default = {
  args: {
    size: 'm',
    className: '',
  },
};
