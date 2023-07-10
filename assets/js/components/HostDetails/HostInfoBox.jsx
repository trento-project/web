import React from 'react';

import ListView from '@components/ListView';
import ProviderLabel from '@components/ProviderLabel';

function HostInfoBox({ provider, agentVersion }) {
  return (
    <div className="my-4 bg-white shadow rounded-lg px-8 py-4">
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
            title: '',
            content: '',
          },
        ]}
      />
    </div>
  );
}

export default HostInfoBox;
