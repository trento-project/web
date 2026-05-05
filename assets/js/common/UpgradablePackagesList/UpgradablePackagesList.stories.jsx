// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import { csvDataupgradablePackageFactory } from '@lib/test-utils/factories/relevantPatches';
import { action } from 'storybook/actions';

import UpgradablePackagesList from './UpgradablePackagesList';

export default {
  title: 'Components/UpgradablePackagesList',
  component: UpgradablePackagesList,
  argTypes: {
    onPatchClick: {
      action: 'patch clicked',
      description: 'Callback when patch is clicked',
    },
    upgradablePackages: {
      control: { type: 'object' },
      description: 'List of upgradable packages',
    },
    patchesLoading: {
      description: 'Are patches loading?',
      control: { type: 'boolean' },
    },
    sortDirection: {
      description:
        'Specifies the current sort order (asc or desc) for the Latest Package column',
      control: { type: 'text' },
    },
    toggleSortDirection: {
      description:
        'Callback function invoked when the Latest Package column header is clicked to toggle sort order',
      action: 'toggle sort direction',
    },
  },
};

export const Default = {
  args: {
    hostname: 'Example Host',
    patchesLoading: false,
    upgradablePackages: csvDataupgradablePackageFactory.buildList(2),
    onPatchClick: action('onPatchClick'),
    toggleSortDirection: action('toggleSortDirection'),
  },
};

export const PatchesLoading = {
  args: {
    ...Default.args,
    hostname: 'Example Host',
    patchesLoading: true,
    upgradablePackages: csvDataupgradablePackageFactory.buildList(2),
  },
};
