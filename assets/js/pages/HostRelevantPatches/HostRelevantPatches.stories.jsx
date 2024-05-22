import React from 'react';
import { action } from '@storybook/addon-actions';

import { relevantPatchFactory } from '@lib/test-utils/factories/relevantPatches';
import { hostFactory } from '@lib/test-utils/factories/hosts';

import HostRelevanPatches from './HostRelevantPatches';

function ContainerWrapper({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
  );
}

export default {
  title: 'Layouts/HostRelevanPatches',
  components: HostRelevanPatches,
  argTypes: {},
  render: (args) => (
    <ContainerWrapper>
      <HostRelevanPatches {...args} />
    </ContainerWrapper>
  ),
};

export const HasPatches = {
  args: {
    host: hostFactory.build().hostname,
    patches: relevantPatchFactory.buildList(5),
    onNavigate: action('onNavigate'),
  },
};
