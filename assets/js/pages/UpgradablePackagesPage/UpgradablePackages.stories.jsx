import { hostFactory } from '@lib/test-utils/factories/hosts';
import { upgradablePackageFactory } from '@lib/test-utils/factories/upgradablePackage';
import React from 'react';
import { action } from 'storybook/actions';

import UpgradablePackages from './UpgradablePackages';

export default {
  title: 'Layouts/UpgradablePackages',
  component: UpgradablePackages,
  argTypes: {
    hostName: {
      control: { type: 'text' },
      description: 'Host name',
    },
    upgradablePackages: {
      control: { type: 'object' },
      description: 'Array of upgradable package objects',
    },
    patchesLoading: {
      control: { type: 'boolean' },
      description: 'Loading state for patches',
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
    onPatchClick: action('onPatchClick'),
    onLoad: action('onLoad'),
  },
};

export const Empty = {
  args: {
    ...Default.args,
    hostName: hostFactory.build().hostname,
    upgradablePackages: [],
    patchesLoading: false,
    onPatchClick: action('onPatchClick'),
    onLoad: action('onLoad'),
  },
};
