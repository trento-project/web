import React from 'react';

import ListView from '@common/ListView';
import ProviderLabel from '@common/ProviderLabel';

function HostInfoBox({ arch, provider, agentVersion }) {
  return (
    <div className="my-6 bg-white shadow rounded-lg px-8 py-4">
      <ListView
        orientation="vertical"
        data={[
          {
            title: 'Provider',
            content: provider,
            render: (content) => <ProviderLabel provider={content} />,
          },
          { title: 'Agent version', content: agentVersion },
          {
            title: 'Architecture',
            content: arch,
          },
        ]}
      />
    </div>
  );
}

export default HostInfoBox;
