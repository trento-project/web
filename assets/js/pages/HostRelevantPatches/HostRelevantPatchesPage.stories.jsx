import React from 'react';
import { action } from '@storybook/addon-actions';

import { relevantPatchFactory } from '@lib/test-utils/factories/relevantPatches';
import { hostFactory } from '@lib/test-utils/factories/hosts';

import HostRelevantPatchesPage from './HostRelevantPatchesPage';

export default {
  title: 'Layouts/HostRelevantPatchesPage',
  components: HostRelevantPatchesPage,
  argTypes: {},
  render: (args) => <HostRelevantPatchesPage {...args} />,
};

export const HasPatches = {
  args: {
    hostName: hostFactory.build().hostname,
    patches: relevantPatchFactory.buildList(5),
    onNavigate: action('onNavigate'),
  },
};
