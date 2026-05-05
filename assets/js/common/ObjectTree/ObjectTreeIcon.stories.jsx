import ObjectTree from '.';

export default {
  title: 'Components/ObjectTreeIcon',
  component: ObjectTree,
  argTypes: {
    expanded: {
      description: 'The expanded prop',
      control: { type: 'boolean' },
    },
  },
};

export const Default = {
  args: {
    expanded: '',
  },
};
