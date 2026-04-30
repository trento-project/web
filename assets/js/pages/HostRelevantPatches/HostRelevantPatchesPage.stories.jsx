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
      control: 'text',
      description: 'Host name',
      table: {
        type: { summary: 'string' },
      },
    },
    patches: {
      control: 'object',
      description: 'Array of patch objects',
      table: {
        type: { summary: 'array' },
      },
    },
    onNavigate: {
      action: 'onNavigate',
      description: 'Navigation callback handler',
      table: {
        type: { summary: 'function' },
      },
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
  },
};
