import { upgradablePackageFactory } from '@lib/test-utils/factories/relevantPatches';
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
    onPatchClick: {
      action: 'patch clicked',
      description: 'Callback when patch is clicked',
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
    patchesLoading: false,
    upgradablePackages: upgradablePackageFactory.buildList(2),
  },
};

export const PatchesLoading = {
  args: {
    hostname: 'Example Host',
    patchesLoading: true,
    upgradablePackages: upgradablePackageFactory.buildList(2),
  },
};
