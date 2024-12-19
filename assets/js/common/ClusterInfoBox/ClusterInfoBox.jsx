import React from 'react';

import ListView from '@common/ListView';
import ProviderLabel from '@common/ProviderLabel';
import ClusterTypeLabel from '@common/ClusterTypeLabel';

function ClusterInfoBox({
  clusterType,
  provider,
  architectureType,
  scaleUpScenario,
}) {
  return (
    <div className="tn-cluster-details w-full my-6 mr-4 bg-white shadow rounded-lg px-8 py-4">
      <ListView
        className="grid-flow-row"
        titleClassName="text-lg"
        orientation="vertical"
        data={[
          {
            title: 'HA Scenario',
            content: clusterType,
            render: (content) => (
              <ClusterTypeLabel
                clusterType={content}
                clusterScenario={scaleUpScenario}
                architectureType={architectureType}
              />
            ),
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
