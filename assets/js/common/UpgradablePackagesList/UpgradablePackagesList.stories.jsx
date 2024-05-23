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
  },
};

export const Default = {
  args: {
    hostname: 'Example Host',
    upgradablePackages: upgradablePackageFactory.buildList(4),
  },
};
