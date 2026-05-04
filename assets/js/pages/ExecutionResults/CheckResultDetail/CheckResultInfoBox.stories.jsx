import Component from './CheckResultInfoBox';

export default {
  title: 'Components/CheckResultInfoBox',
  component: Component,
  argTypes: {
    checkID: {
      description: 'Identifier for the checkID',
      control: { type: 'text' },
    },
    resultTargetType: {
      description: 'The resultTargetType prop',
      control: { type: 'text' },
    },
    resultTargetName: {
      description: 'The resultTargetName prop',
      control: { type: 'text' },
    },
    provider: {
      description: 'Identifier for the provider',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    checkID: '',
    resultTargetType: '',
    resultTargetName: '',
    provider: '',
  },
};
