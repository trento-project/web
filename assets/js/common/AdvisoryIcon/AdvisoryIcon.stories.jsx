import React from 'react';

import AdvisoryIcon from './AdvisoryIcon';

export default {
  title: 'Components/AdvisoryIcon',
  component: AdvisoryIcon,
  argTypes: {
    type: {
      description: 'The type of advisory',
      options: ['security_advisory', 'bugfix', 'enhancement', 'NONEXISTENT'],
      control: { type: 'radio' },
    },
    centered: {
      description: 'Center the icon',
      control: { type: 'boolean' },
    },
    hoverOpacity: {
      description: 'Change opacity on hover',
      control: { type: 'boolean' },
    },
    size: {
      description: 'Size of the icon',
      options: ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'],
      control: { type: 'radio' },
    },
  },
  render: (args) => <AdvisoryIcon {...args} />,
};

export const Default = {
  args: {
    type: 'security_advisory',
    centered: false,
    hoverOpacity: false,
    size: 'm',
  },
};

export const SecurityAdvisory = {
  args: {
    ...Default.args,
    type: 'security_advisory',
    centered: false,
    hoverOpacity: true,
    size: 'l',
  },
};

export const Bugfix = {
  args: {
    ...Default.args,
    type: 'bugfix',
  },
};

export const Enhancement = {
  args: {
    ...Default.args,
    type: 'enhancement',
  },
};

export const Unknown = {
  args: {
    ...Default.args,
    type: '',
  },
};
