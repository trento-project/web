import React from 'react';

import AzureDetails from './AzureDetails';
import AwsDetails from './AwsDetails';

const CloudDetails = ({ provider, provider_data }) => {
  switch (provider) {
    case 'azure':
      return <AzureDetails provider={provider} provider_data={provider_data} />;
    case 'aws':
      return <AwsDetails provider={provider} provider_data={provider_data} />;
  }
};

export default CloudDetails;
