import Component from './SapSystemLink';

export default {
  title: 'Components/SapSystemLink',
  component: Component,
  argTypes: {
    systemType: {
      description: 'The systemType prop',
      control: { type: 'text' },
    },
    sapSystemId: {
      description: 'Unique identifier for the SAP system',
      control: { type: 'text' },
    },
    children: {
      description: 'Content or text displayed inside the component',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: { systemType: '', sapSystemId: '' },
};
