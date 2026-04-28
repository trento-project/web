import { csvDataupgradablePackageFactory } from '@lib/test-utils/factories/relevantPatches';
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
      control: {
        type: 'array',
      },
      description: 'List of upgradable packages',
    },
    patchesLoading: {
      description: 'Are patches loading?',
    },
    sortDirection: {
      type: 'string',
      description:
        'Specifies the current sort order (asc or desc) for the Latest Package column',
      control: { type: 'text' },
    },
    toggleSortDirection: {
      type: 'function',
      description:
        'Callback function invoked when the Latest Package column header is clicked to toggle sort order',
    },
  },
};

export const Default = {
  args: {
    hostname: 'Example Host',
    patchesLoading: false,
    upgradablePackages: csvDataupgradablePackageFactory.buildList(2),
  },
};

export const PatchesLoading = {
  args: {
    hostname: 'Example Host',
    patchesLoading: true,
    upgradablePackages: csvDataupgradablePackageFactory.buildList(2),
  },
};
