import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import ListView from '@components/ListView';

const HostDetails = () => {
  const { hostID } = useParams();
  const host = useSelector((state) =>
    state.hostsList.hosts.find(({ id }) => id === hostID)
  );

  console.log(host);

  if (!host) {
    return <div>Not Found</div>;
  }

  return (
    <div>
      <div>Host details: {host.hostname}</div>

      <div className="mt-4">
        <ListView
          orientation="vertical"
          data={[
            { title: 'Name', content: host.hostname },
            { title: 'Cluster', content: host.cluster.name },
            { title: 'Agent version', content: host.agent_version },
          ]}
        />
      </div>
      <div className="mt-4">
        <div>Cloud details</div>
        <ListView
          orientation="vertical"
          rows={2}
          data={[
            {
              title: 'Provider',
              content: host.provider,
              render: (content) => <p className="capitalize">{content}</p>,
            },
            { title: 'VM Size', content: host.provider_data.vm_name },
            { title: 'VM Name', content: host.provider_data.vm_name },
            {
              title: 'Data disk number',
              content: host.provider_data.data_disk_number,
            },
            { title: 'Resource group', content: host.provider_data.location },
            { title: 'Offer', content: host.provider_data.offer },
            { title: 'Location', content: host.provider_data.location },
            { title: 'SKU', content: host.provider_data.sku },
          ]}
        />
      </div>
    </div>
  );
};

export default HostDetails;
