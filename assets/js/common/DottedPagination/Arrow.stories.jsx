import DottedPagination from '.';
import { action } from 'storybook/actions';

export default {
  title: 'Components/Arrow',
  component: DottedPagination,
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
    children: '→',
    onClick: action('onClick'),
  },
};
