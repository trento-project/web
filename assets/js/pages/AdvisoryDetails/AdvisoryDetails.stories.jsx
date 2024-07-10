import React from 'react';

import AdvisoryDetails from './AdvisoryDetails';

export default {
  title: 'Layouts/AdvisoryDetails',
  components: AdvisoryDetails,
  argTypes: {},
  render: (args) => <AdvisoryDetails {...args} />,
};

export const Default = {
  args: {
    advisoryName: 'SUSE-15-SP4-2023-3369',
    errata: {
      errata_details: {
        issue_date: Date.now(),
        update_date: Date.now(),
        synopsis: 'I think my Geekos ate my quiche 🦎🦎',
        advisory_status: 'stable',
        type: 'security_advisory',
        description: `My Geekos really love the cakes I order from the crab bakery.
Yesterday, I left before the post arrived. Normally, the post just delivers my packages the next day.
However, the post didn't come by today, and I am starting to wonder, if my Geekos ate my quiche. AITA? 😟`,
        reboot_suggested: true,
      },
      fixes: {
        4815162342: 'Geekos unexpectedly eating quiches',
      },
      cves: ['CVE-2024-35938'],
      affected_packages: [
        {
          name: 'libprocps7',
          version: '3.3.15',
          release: '7.34.1',
          epoch: '150000',
          arch_label: 'x86_64',
        },
      ],
    },
    affectsPackageMaintenanceStack: false,
  },
};
