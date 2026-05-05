import Loading from './Loading';

export default {
  title: 'Components/Loading',
  component: Loading,
  argTypes: {
    className: {
      description: 'Additional CSS classes for the loading container.',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    className: '',
  },
};
