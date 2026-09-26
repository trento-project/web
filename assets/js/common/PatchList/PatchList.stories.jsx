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
    searchParams: {
      description:
        'URL search params (e.g. `new URLSearchParams(window.location.search)`) used for filters/pagination',
      control: { type: 'object' },
    },
    setSearchParams: {
      description:
        'Setter function to update search params (usually from React Router)',
      action: 'setSearchParams',
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
    searchParams: new URLSearchParams(),
    setSearchParams: action('setSearchParams'),
  },
};

export const NoPatches = {
  args: {
    ...Default.args,
    patches: undefined,
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
  },
};
