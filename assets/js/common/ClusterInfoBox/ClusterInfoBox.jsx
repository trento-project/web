import React from 'react';

import { getClusterTypeLabel } from '@lib/model/clusters';

import ListView from '@common/ListView';
import ProviderLabel from '@common/ProviderLabel';

// eslint-disable-next-line import/prefer-default-export
function ClusterInfoBox({ haScenario, provider }) {
  return (
    <div className="tn-cluster-details w-full my-6 mr-4 bg-white shadow rounded-lg px-8 py-4">
      <ListView
        className="grid-flow-row"
        titleClassName="text-lg"
        orientation="vertical"
        data={[
          {
            title: 'HA Scenario',
            content: getClusterTypeLabel(haScenario),
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

export default ClusterInfoBox;
