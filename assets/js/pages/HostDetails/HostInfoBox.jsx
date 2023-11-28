import React from 'react';

import ListView from '@common/ListView';
import ProviderLabel from '@components/ProviderLabel';

function HostInfoBox({ provider, agentVersion }) {
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
            // This empty item in the list view is a hack to get the desired spacing rendered
            title: '',
            content: '',
          },
        ]}
      />
    </div>
  );
}

export default HostInfoBox;
