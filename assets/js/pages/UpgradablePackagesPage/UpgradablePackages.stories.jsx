import React from 'react';

import { upgradablePackageFactory } from '@lib/test-utils/factories/upgradablePackage';
import { hostFactory } from '@lib/test-utils/factories/hosts';

import UpgradablePackages from './UpgradablePackages';

export default {
  title: 'Layouts/UpgradablePackages',
  component: UpgradablePackages,
  argTypes: {
    hostName: {
      control: { type: 'text' },
      description: 'Host name',
      table: {
        type: { summary: 'string' },
      },
    },
    upgradablePackages: {
      control: { type: 'object' },
      description: 'Array of upgradable package objects',
      table: {
        type: { summary: 'array' },
      },
    },
    patchesLoading: {
      control: { type: 'boolean' },
      description: 'Loading state for patches',
      table: {
        type: { summary: 'boolean' },
      },
    },
    onPatchClick: {
      action: 'onPatchClick',
      description: 'Callback when a patch is clicked',
    },
    onLoad: {
      action: 'onLoad',
      description: 'Callback when list is loaded',
    },
  },
  render: (args) => <UpgradablePackages {...args} />,
};

export const Default = {
  args: {
    hostName: hostFactory.build().hostname,
    upgradablePackages: upgradablePackageFactory.buildList(15),
  },
};

export const Empty = {
  args: {
    hostName: hostFactory.build().hostname,
    upgradablePackages: [],
    patchesLoading: false,
  },
};
