import React from 'react';

import ListView from '@components/ListView';
import ProviderLabel from '@components/ProviderLabel';

const haScenarioToString = {
  hana_scale_up: 'HANA scale-up',
  hana_scale_out: 'HANA scale-out',
};

// eslint-disable-next-line import/prefer-default-export
export function ClusterInfoBox({ haScenario, provider }) {
  return (
    <div className="tn-cluster-details w-full my-4 mr-4 bg-white shadow rounded-lg px-8 py-4">
      <ListView
        className="grid-flow-row"
        titleClassName="text-lg"
        orientation="vertical"
        data={[
          {
            title: 'HA Scenario',
            content: haScenarioToString[haScenario] ?? 'Unknown',
          },
          {
            title: 'Provider',
            content: provider,
            render: (content) => <ProviderLabel provider={content} />,
          },
        ]}
      />
    </div>
  );
}
