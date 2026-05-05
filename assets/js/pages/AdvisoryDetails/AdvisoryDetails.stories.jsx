import React from 'react';
import { advisoryErrataFactory } from '@lib/test-utils/factories/advisoryErrata';
import AdvisoryDetails from './AdvisoryDetails';

const errata = advisoryErrataFactory.build();

export default {
  title: 'Layouts/AdvisoryDetails',
  component: AdvisoryDetails,
  argTypes: {
    advisoryName: {
      control: { type: 'text' },
      description: 'Advisory name',
    },
    errata: {
      control: { type: 'object' },
      description:
        'Errata object containing details, fixes, CVEs, and affected items',
    },
    affectsPackageMaintenanceStack: {
      control: { type: 'boolean' },
      description: 'Whether the advisory affects the package maintenance stack',
    },
    timezone: {
      description: 'Timezone string for date formatting.',
      control: { type: 'text' },
    },
  },
  render: (args) => <AdvisoryDetails {...args} />,
};

export const Default = {
  args: {
    advisoryName: 'SUSE-15-SP4-2023-3369',
    errata,
    affectsPackageMaintenanceStack: false,
  },
};

export const Empty = {
  args: {
    ...Default.args,
    errata: advisoryErrataFactory.build({
      fixes: {},
      cves: [],
      affected_packages: [],
      affected_systems: [],
    }),
  },
};
