import React from 'react';

import AdvisoryDetails from './AdvisoryDetails';

export default {
  title: 'Layouts/AdvisoryDetails',
  components: AdvisoryDetails,
  argTypes: {},
  render: (args) => <AdvisoryDetails {...args} />,
};

export const Default = {
  args: {
    name: 'SUSE-15-SP4-2023-3369',
    status: 'Stable',
    type: 'bugfix',
    synopsis: '🦎🦎🦎🦎🦎🦎🦎🦎🦎🦎🦎',
    description: '🪿🪿🪿🪿🪿🪿🪿🪿🪿🪿🪿',
    issueDate: Date.now(),
    updateDate: Date.now(),
    rebootRequired: false,
    affectsPackageMaintanaceStack: false,
    fixes: undefined,
    cves: undefined,
    packages: undefined,
  },
};
