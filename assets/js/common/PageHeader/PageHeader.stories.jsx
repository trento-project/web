import Component from './PageHeader';

export default {
  title: 'Components/PageHeader',
  component: Component,
  argTypes: {
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: { className: '', children: 'Default children' },
};
