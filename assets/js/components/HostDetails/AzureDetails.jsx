import React from 'react';

import ListView from '@components/ListView';

const AzureDetails = ({ provider, provider_data }) => {
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
            render: (content) => <p className="capitalize">{content}</p>,
          },
          { title: 'VM Size', content: provider_data?.vm_size },
          { title: 'VM Name', content: provider_data?.vm_name },
          {
            title: 'Data disk number',
            content: provider_data?.data_disk_number,
          },
          {
            title: 'Resource group',
            content: provider_data?.resource_group,
          },
          { title: 'Offer', content: provider_data?.offer },
          { title: 'Location', content: provider_data?.location },
          { title: 'SKU', content: provider_data?.sku },
        ]}
      />
    </div>
  );
};

export default AzureDetails;
