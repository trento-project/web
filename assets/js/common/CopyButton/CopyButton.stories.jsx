import CopyButton from '.';

export default {
  title: 'Components/CopyButton',
  component: CopyButton,
  argTypes: {
    content: {
      description: 'Text content to copy',
      control: 'text',
    },
  },
};

export const Default = {
  args: {
    content: 'this is a test content',
  },
};
