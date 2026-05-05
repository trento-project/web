import Component from './Arrow';
import { action } from 'storybook/actions';

export default {
  title: 'Components/Arrow',
  component: Component,
  argTypes: {
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
    onClick: {
      description: 'Callback function invoked when click',
      action: 'onClick',
    },
  },
};

export const Default = {
  args: {
    onClick: action('onClick'),
  },
};
