import ObjectTreeNode from './ObjectTreeNode';
// import { action } from 'storybook/actions';

export default {
  title: 'Components/ObjectTreeNode',
  component: ObjectTreeNode,
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
      control: { type: 'number' },
    },
  },
};

export const Default = {
  args: {
    element: { name: 'root', value: 'data', children: [] },
    isBranch: false,
    isExpanded: false,
    getNodeProps: () => ({ className: 'object-tree-node' }),
    level: 1,
  },
};

export const BranchNode = {
  args: {
    element: { name: 'branch', value: null, children: [] },
    isBranch: true,
    isExpanded: false,
    getNodeProps: () => ({ className: 'object-tree-node' }),
    level: 1,
  },
};

export const ExpandedBranch = {
  args: {
    element: { name: 'branch', value: null, children: [] },
    isBranch: true,
    isExpanded: true,
    getNodeProps: () => ({ className: 'object-tree-node' }),
    level: 1,
  },
};
