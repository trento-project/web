import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { action } from 'storybook/actions';

import { relevantPatchFactory } from '@lib/test-utils/factories/relevantPatches';
import PatchList from '.';

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
    patches: relevantPatchFactory.buildList(5),
    onNavigate: action('onNavigate'),
  },
};

export const NoPatches = {
  args: {
    patches: undefined,
    onNavigate: action('onNavigate'),
  },
};

export const AllStates = {
  args: {
    patches: [
      relevantPatchFactory.build({ advisory_type: 'security_advisory' }),
      relevantPatchFactory.build({ advisory_type: 'bugfix' }),
      relevantPatchFactory.build({ advisory_type: 'enhancement' }),
    ],
    onNavigate: action('onNavigate'),
  },
};
