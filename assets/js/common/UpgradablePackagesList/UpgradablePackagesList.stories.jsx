import { upgradablePackageFactory } from '@lib/test-utils/factories/upgradablePackage';
import UpgradablePackagesList from './UpgradablePackagesList';

export default {
  title: 'Components/UpgradablePackagesList',
  component: UpgradablePackagesList,
  argTypes: {
    hostname: {
      type: 'string',
      control: { type: 'text' },
      description: 'The name of the host',
    },
    upgradablePackages: {
      control: {
        type: 'array',
      },
      description: 'List of upgradable packages',
    },
    patchesLoading: {
      description: 'Are patches loading?',
    },
  },
};

export const Default = {
  args: {
    hostname: 'Example Host',
    upgradablePackages: upgradablePackageFactory.buildList(4),
  },
};

export const PatchesLoading = {
  args: {
    hostname: 'Example Host',
    patchesLoading: true,
    upgradablePackages: upgradablePackageFactory.buildList(4),
  },
};
