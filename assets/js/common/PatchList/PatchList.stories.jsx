// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { relevantPatchFactory } from '@lib/test-utils/factories/relevantPatches';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { action } from 'storybook/actions';

import PatchList from './PatchList';

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
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
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
    ...Default.args,
    patches: undefined,
    onNavigate: action('onNavigate'),
  },
};

export const AllStates = {
  args: {
    ...Default.args,
    patches: [
      relevantPatchFactory.build({ advisory_type: 'security_advisory' }),
      relevantPatchFactory.build({ advisory_type: 'bugfix' }),
      relevantPatchFactory.build({ advisory_type: 'enhancement' }),
    ],
    onNavigate: action('onNavigate'),
  },
};
