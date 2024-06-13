import React from 'react';

import { upgradablePackageFactory } from '@lib/test-utils/factories/upgradablePackage';
import { hostFactory } from '@lib/test-utils/factories/hosts';

import UpgradablePackagesPage from './UpgradablePackagesPage';

export default {
  title: 'Layouts/UpgradablePackagesPage',
  components: UpgradablePackagesPage,
  argTypes: {},
  render: (args) => <UpgradablePackagesPage {...args} />,
};

export const Default = {
  args: {
    hostName: hostFactory.build().hostname,
    upgradablePackages: upgradablePackageFactory.buildList(5),
  },
};
