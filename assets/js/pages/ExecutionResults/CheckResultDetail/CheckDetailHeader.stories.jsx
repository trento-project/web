import Component from './CheckDetailHeader';

export default {
  title: 'Components/CheckDetailHeader',
  component: Component,
  argTypes: {
    checkID: {
      description: 'Identifier for the checkID',
      control: { type: 'text' },
    },
    checkDescription: {
      description: 'The checkDescription prop',
      control: { type: 'text' },
    },
    targetID: {
      description: 'Identifier for the targetID',
      control: { type: 'text' },
    },
    targetType: {
      description: 'The targetType prop',
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
    cloudProvider: {
      description: 'Identifier for the cloudProvider',
      control: { type: 'text' },
    },
    result: {
      description: 'The result prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    checkID: '',
    checkDescription: '',
    targetID: '',
    targetType: '',
    resultTargetType: '',
    resultTargetName: '',
    cloudProvider: '',
    result: '',
  },
};
