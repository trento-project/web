import Modal from '.';
import { action } from 'storybook/actions';

export default {
  title: 'Components/Modal',
  component: Modal,
  argTypes: {
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
    open: {
      description: 'Whether the modal or dropdown is open',
      control: { type: 'boolean' },
    },
    onClose: {
      description: 'Callback function invoked when closing the modal',
      action: 'onClose',
    },
    title: {
      description: 'Title text for the component',
      control: { type: 'text' },
    },
    className: {
      description: 'Additional CSS classes applied to the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    children: 'Default children',
    title: 'Default title',
    className: '',
    open: true,
    onClose: action('onClose'),
  },
};
