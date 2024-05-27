import React from 'react';
import { action } from '@storybook/addon-actions';

import { relevantPatchFactory } from '@lib/test-utils/factories/relevantPatches';
import { hostFactory } from '@lib/test-utils/factories/hosts';

import HostRelevanPatchesPage from './HostRelevantPatchesPage';

export default {
  title: 'Layouts/HostRelevanPatchesPage',
  components: HostRelevanPatchesPage,
  argTypes: {},
  render: (args) => <HostRelevanPatchesPage {...args} />,
};

export const HasPatches = {
  args: {
    hostName: hostFactory.build().hostname,
    patches: relevantPatchFactory.buildList(5),
    onNavigate: action('onNavigate'),
  },
};
