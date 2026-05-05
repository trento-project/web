import SaptuneDetails from '.';

export default {
  title: 'Components/SaptuneVersion',
  component: SaptuneDetails,
  argTypes: {
    sapPresent: {
      description: 'The sapPresent prop',
      control: { type: 'text' },
    },
    version: {
      description: 'The version prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    sapPresent: true,
    version: '7.3.0',
  },
};
