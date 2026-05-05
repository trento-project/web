import React from 'react';
import { MemoryRouter } from 'react-router';
import { relevantPatchFactory } from '@lib/test-utils/factories/relevantPatches';
import PatchList from '.';
import { action } from 'storybook/actions';

export default {
  title: 'Components/PatchList',
  component: PatchList,
  argTypes: {
    patches: {
      control: { type: 'object' },
      description: 'A list of patches',
      action: 'callback',
    },
    onNavigate: {
      action: 'onNavigate',
      description:
        'Callback function invoked when a patch is selected for navigation',
    },
    timezone: {
      type: 'string',
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
      defaultValue: 'Etc/UTC',
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
