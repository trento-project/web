import LoadingBox from './LoadingBox';

export default {
  title: 'Components/LoadingBox',
  component: LoadingBox,
  argTypes: {
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    text: {
      description: 'Text content displayed in the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    className: '',
    text: 'Default text',
  },
};
