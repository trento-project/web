import Component from './AttributesDetails';

export default {
  title: 'Components/AttributesDetails',
  component: Component,
  argTypes: {
    attributes: {
      description: 'The attributes prop',
      control: { type: 'text' },
    },
    title: {
      description: 'Title text for the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: { attributes: '', title: '' },
};
