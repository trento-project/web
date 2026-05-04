import Component from './ExecutionContainer';

export default {
  title: 'Components/ExecutionContainer',
  component: Component,
  argTypes: {
    catalogLoading: {
      description: 'The catalogLoading prop',
      control: { type: 'text' },
    },
    executionLoading: {
      description: 'The executionLoading prop',
      control: { type: 'text' },
    },
    executionStarted: {
      description: 'The executionStarted prop',
      control: { type: 'text' },
    },
    executionRunning: {
      description: 'The executionRunning prop',
      control: { type: 'text' },
    },
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    catalogLoading: '',
    executionLoading: '',
    executionStarted: '',
    executionRunning: '',
  },
};
