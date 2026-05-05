import Component from './ObjectTreeNode';
import { action } from 'storybook/actions';

export default {
  title: 'Components/ObjectTreeNode',
  component: Component,
  argTypes: {
    element: {
      description: 'Object element to display in the tree',
      control: { type: 'object' },
    },
    isBranch: {
      description: 'Whether the node is a branch (has children)',
      control: { type: 'boolean' },
    },
    isExpanded: {
      description: 'Whether the branch is expanded',
      control: { type: 'boolean' },
    },
    getNodeProps: {
      description: 'Function that returns node properties',
      action: 'getNodeProps',
    },
    level: {
      description: 'Nesting level for indentation',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    element: { name: 'root', value: 'data', children: [] },
    isBranch: false,
    isExpanded: false,
    getNodeProps: action('getNodeProps'),
    level: '1',
  },
};
