import React from 'react';
import { action } from '@storybook/addon-actions';

import { relevantPatchFactory } from '@lib/test-utils/factories/relevantPatches';
import { hostFactory } from '@lib/test-utils/factories/hosts';

import HostRelevanPatches from './HostRelevantPatches';

export default {
  title: 'Layouts/HostRelevanPatches',
  components: HostRelevanPatches,
  argTypes: {},
  render: (args) => <HostRelevanPatches {...args} />,
};

export const HasPatches = {
  args: {
    hostName: hostFactory.build().hostname,
    patches: relevantPatchFactory.buildList(5),
    onNavigate: action('onNavigate'),
  },
};
