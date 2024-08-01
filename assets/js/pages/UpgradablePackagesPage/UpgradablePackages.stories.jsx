import React from 'react';

import { upgradablePackageFactory } from '@lib/test-utils/factories/upgradablePackage';
import { hostFactory } from '@lib/test-utils/factories/hosts';

import UpgradablePackages from './UpgradablePackages';

export default {
  title: 'Layouts/UpgradablePackages',
  components: UpgradablePackages,
  argTypes: {},
  render: (args) => <UpgradablePackages {...args} />,
};

export const Default = {
  args: {
    hostName: hostFactory.build().hostname,
    upgradablePackages: upgradablePackageFactory.buildList(15),
  },
};
