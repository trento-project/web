import ExecutionResults from '.';

export default {
  title: 'Components/ExecutionContainer',
  component: ExecutionResults,
  argTypes: {
    catalogLoading: {
      description: 'The catalogLoading prop',
      control: { type: 'boolean' },
    },
    executionLoading: {
      description: 'The executionLoading prop',
      control: { type: 'boolean' },
    },
    executionStarted: {
      description: 'The executionStarted prop',
      control: { type: 'boolean' },
    },
    executionRunning: {
      description: 'The executionRunning prop',
      control: { type: 'boolean' },
    },
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    catalogLoading: false,
    executionLoading: false,
    executionStarted: false,
    executionRunning: false,
    children: 'Execution content',
  },
};
