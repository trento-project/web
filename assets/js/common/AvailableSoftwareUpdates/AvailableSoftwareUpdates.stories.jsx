import AvailableSoftwareUpdates from './AvailableSoftwareUpdates';

export default {
  title: 'Components/AvailableSoftwareUpdates',
  component: AvailableSoftwareUpdates,
  argTypes: {
    relevantPatches: {
      type: 'number',
      description: 'Number of relevant patches available for the system',
      control: {
        type: 'number',
      },
    },
    upgradablePackages: {
      type: 'number',
      description: 'Number of upgradable packages for the system',
      control: {
        type: 'number',
      },
    },
    tooltip: {
      type: 'string',
      description: 'Content of the tooltip, if it is rendered',
    },
    loading: {
      type: 'bool',
      description: 'Is data being fetched?',
    },
  },
};

export const Default = {
  args: { relevantPatches: 412, upgradablePackages: 234 },
};

export const Cool = {
  args: { relevantPatches: 0, upgradablePackages: 42 },
};

export const Unknown = { args: { tooltip: 'SUSE Manager is not available' } };

export const Loading = { args: { loading: true } };
