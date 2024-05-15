import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { relevantPatchFactory } from '@lib/test-utils/factories/relevantPatches';
import PatchList from '.';

const enhancePatchWithNavigation = (patches = []) => {
  const enhance = (patch) => ({
    ...patch,
    onNavigate: () => alert(`Navigating to Patch #${patch.id}`),
  });

  return Array.isArray(patches) ? patches.map(enhance) : enhance(patches);
};

export default {
  title: 'Components/PatchList',
  components: PatchList,
  argTypes: {
    patches: {
      control: {
        type: 'array',
      },
      description: 'A list of patches',
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  render: (args) => <PatchList {...args} />,
};

export const Default = {
  args: {
    patches: enhancePatchWithNavigation(relevantPatchFactory.buildList(5)),
  },
};

export const NoPatches = {
  args: {
    patches: undefined,
  },
};

export const AllStates = {
  args: {
    patches: enhancePatchWithNavigation([
      relevantPatchFactory.build({ advisory_type: 'security_advisory' }),
      relevantPatchFactory.build({ advisory_type: 'bugfix' }),
      relevantPatchFactory.build({ advisory_type: 'enhancement' }),
    ]),
  },
};
