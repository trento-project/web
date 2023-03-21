import React from 'react';

import ListView from '@components/ListView';
import ProviderLabel from '@components/ProviderLabel';
import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';

const targetTypeString = {
  [TARGET_HOST]: 'Host',
  [TARGET_CLUSTER]: 'Cluster',
};

function CheckResultInfoBox({ checkID, targetType, targetName, provider }) {
  return (
    <div className="w-full my-4 mr-4 bg-white shadow rounded-lg px-8 py-4">
      <ListView
        className="grid-flow-row"
        titleClassName="text-lg"
        orientation="vertical"
        data={[
          {
            title: 'Check ID',
            content: checkID,
          },
          {
            title: targetTypeString[targetType] || 'Unknown target type',
            content: targetName,
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

export default CheckResultInfoBox;
