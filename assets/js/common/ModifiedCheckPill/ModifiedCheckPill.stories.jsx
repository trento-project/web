import Component from './ModifiedCheckPill';

export default {
  title: 'Components/ModifiedCheckPill',
  component: Component,
  argTypes: {
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    content: {
      description: 'The content prop',
      control: { type: 'text' },
    },
    customized: {
      description: 'The customized prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: { className: '', content: '', customized: '' },
};
