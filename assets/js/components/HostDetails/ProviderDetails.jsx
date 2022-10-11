import React from 'react';
import classNames from 'classnames';
import Pill from '@components/Pill';
import ListView from '@components/ListView';

const ProviderDetails = ({ provider, provider_data }) => {
  const data = {
    azure: [
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
    ],
    aws: [
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
      { title: 'AMI ID', content: provider_data?.ami_id },
      {
        title: 'Region',
        content: `${provider_data?.region} (${provider_data?.availability_zone})`,
      },
      { title: 'VPC ID', content: provider_data?.vpc_id },
    ],
    gcp: [
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
    ],
    kvm: [
      {
        title: 'Provider',
        content: provider,
        render: (content) => <p className="uppercase">{content}</p>,
      },
    ],
    nutanix: [
      {
        title: 'Provider',
        content: provider,
        render: (content) => <p className="capitalize">{content}</p>,
      },
    ],
  };

  return data[provider] ? (
    <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
      <ListView
        className={classNames({ 'grid-rows-2': data[provider].length > 1 })}
        orientation="vertical"
        rows={data[provider].length > 1 ? 2 : 1}
        data={data[provider]}
      />
    </div>
  ) : (
    <Pill className="bg-gray-200 text-gray-800 shadow">
      Provider not recognized
    </Pill>
  );
};

export default ProviderDetails;
