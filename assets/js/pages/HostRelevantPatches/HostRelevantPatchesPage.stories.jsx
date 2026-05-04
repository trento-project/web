import React from 'react';
import { action } from 'storybook/actions';

import { relevantPatchFactory } from '@lib/test-utils/factories/relevantPatches';
import { hostFactory } from '@lib/test-utils/factories/hosts';

import HostRelevantPatchesPage from './HostRelevantPatchesPage';

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Layouts/HostRelevantPatchesPage',
  components: HostRelevantPatchesPage,
  argTypes: {
    hostName: {
      type: 'string',
      description: 'The hostname to display in the header and CSV filename.',
      control: { type: 'text' },
    },
    onNavigate: {
      type: { name: 'function' },
      description: 'Callback for navigation actions in PatchList.',
      action: 'onNavigate',
    },
    patches: {
      type: { name: 'array' },
      description: 'Array of patch objects to display.',
    },
    timezone: {
      type: 'string',
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
      defaultValue: 'Etc/UTC',
    },
  },
  render: (args) => (
    <ContainerWrapper>
      <HostRelevantPatchesPage {...args} />
    </ContainerWrapper>
  ),
};

export const HasPatches = {
  args: {
    hostName: hostFactory.build().hostname,
    patches: relevantPatchFactory.buildList(15),
    onNavigate: action('onNavigate'),
    timezone: 'Etc/UTC',
  },
};
