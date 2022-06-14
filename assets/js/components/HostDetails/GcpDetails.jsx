import React from 'react';

import ListView from '@components/ListView';

const GcpDetails = ({ provider, provider_data }) => {
  return (
    <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
      <ListView
        className="grid-rows-2"
        orientation="vertical"
        rows={2}
        data={[
          {
            title: 'Provider',
            content: provider,
            render: (content) => <p className="uppercase">{content}</p>,
          },
          { title: 'Machine type', content: provider_data?.machine_type },
          { title: 'Instance name', content: provider_data?.instance_name },
          { title: 'Disk number', content: provider_data?.disk_number },
          { title: 'Project ID', content: provider_data?.project_id },
          { title: 'Image', content: provider_data?.image },
          { title: 'Zone', content: provider_data?.zone },
          { title: 'Network', content: provider_data?.network },
        ]}
      />
    </div>
  );
};

export default GcpDetails;
