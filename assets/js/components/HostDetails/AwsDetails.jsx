import React from 'react';

import ListView from '@components/ListView';

const AwsDetails = ({ provider, provider_data }) => {
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
          { title: 'Instance type', content: provider_data?.instance_type },
          { title: 'Instance ID', content: provider_data?.instance_id },
          {
            title: 'Data disk number',
            content: provider_data?.data_disk_number,
          },
          {
            title: 'Account ID',
            content: provider_data?.account_id,
          },
          { title: 'Ami ID', content: provider_data?.ami_id },
          {
            title: 'Region',
            content: `${provider_data?.region} (${provider_data?.availability_zone})`,
          },
          { title: 'Vpc ID', content: provider_data?.vpc_id },
        ]}
      />
    </div>
  );
};

export default AwsDetails;
