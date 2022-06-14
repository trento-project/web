import React from 'react';
import Pill from '@components/Pill';

import AzureDetails from './AzureDetails';
import AwsDetails from './AwsDetails';
import GcpDetails from './GcpDetails';

const ProviderDetails = ({ provider, provider_data }) => {
  switch (provider) {
    case 'azure':
      return <AzureDetails provider={provider} provider_data={provider_data} />;
    case 'aws':
      return <AwsDetails provider={provider} provider_data={provider_data} />;
    case 'gcp':
      return <GcpDetails provider={provider} provider_data={provider_data} />;
    default:
      return (
        <Pill className="bg-gray-200 text-gray-800 shadow">
          Provider not recognized
        </Pill>
      );
  }
};

export default ProviderDetails;
