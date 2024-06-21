import React from 'react';

import AdvisoryIcon from '.';

export default {
  title: 'Components/AdvisoryIcon',
  components: AdvisoryIcon,
  argTypes: {
    type: {
      description: 'The type of advisory',
      control: {
        type: 'string',
      },
    },
    centered: {
      description: 'Center the icon',
      control: {
        type: 'boolean',
      },
    },
    hoverOpacity: {
      description: 'Change opacity on hover',
      control: {
        type: 'boolean',
      },
    },
    size: {
      description: 'Size of the icon. Values are xs, s, m, l, xl, xxl, xxxl',
      control: {
        type: 'string',
      },
    },
  },

  render: (args) => <AdvisoryIcon {...args} />,
};

export const SecurityAdvisory = {
  args: {
    type: 'security_advisory',
    centered: false,
    hoverOpacity: true,
    size: 'l',
  },
};

export const Bugfix = {
  args: {
    type: 'bugfix',
  },
};

export const Enhancement = {
  args: {
    type: 'enhancement',
  },
};

export const Unknown = {
  args: {
    type: '',
  },
};
