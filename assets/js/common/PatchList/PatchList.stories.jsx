import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { relevantPatchFactory } from '@lib/test-utils/factories/relevantPatches';
import PatchList from './PatchList';

const fakePatchArgs = {
  patches: relevantPatchFactory.buildList(5),
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
  args: fakePatchArgs,
};

export const NoPatches = {
  args: {
    patches: undefined,
  },
};

export const AllStates = {
  args: {
    patches: [
      relevantPatchFactory.build({ advisory_type: 'security_advisory' }),
      relevantPatchFactory.build({ advisory_type: 'bugfix' }),
      relevantPatchFactory.build({ advisory_type: 'enhancement' }),
    ],
  },
};
