import Component from './ObjectTreeIcon';

export default {
  title: 'Components/ObjectTreeIcon',
  component: Component,
  argTypes: {
    expanded: {
      description: 'The expanded prop',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: { expanded: '' },
};
