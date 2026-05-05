import ClusterDetails from '.';

export default {
  title: 'Components/AttributesDetails',
  component: ClusterDetails,
  argTypes: {
    attributes: {
      description: 'The attributes prop',
      control: { type: 'object' },
    },
    title: {
      description: 'Title text for the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    attributes: {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    },
    title: 'Cluster Attributes',
  },
};
