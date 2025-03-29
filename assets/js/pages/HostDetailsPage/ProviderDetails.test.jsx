import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { AWS_PROVIDER } from '@lib/model';
import ProviderDetails from './ProviderDetails';

describe('Provider Details', () => {
  [
    {
      provider: 'aws',
      providerText: 'AWS',
    },
    {
      provider: 'azure',
      providerText: 'Azure',
    },
    {
      provider: 'gcp',
      providerText: 'GCP',
    },
    {
      provider: 'kvm',
      providerText: 'On-premises / KVM',
    },
    {
      provider: 'vmware',
      providerText: 'VMware',
    },
    {
      provider: 'nutanix',
      providerText: 'Nutanix',
    },
  ].forEach(({ provider, providerText }) => {
    it(`should display a box with ${providerText} as the provider`, () => {
      render(<ProviderDetails provider={provider} />);
      expect(screen.getAllByText(/Provider/)).toBeTruthy();
      expect(screen.getAllByText(providerText)).toBeTruthy();
    });
  });

  it('should display an element containing "Provider not recognized"', () => {
    render(<ProviderDetails provider="unrecognized-provider" />);
    expect(document.querySelector('span')).toHaveTextContent(
      'Provider not recognized'
    );
  });

  describe('AWS', () => {
    const metadataLabels = [
      {
        key: 'account_id',
        label: 'Account ID',
      },
      {
        key: 'ami_id',
        label: 'AMI ID',
      },
      // availability_zone is not displayed on its own but as part of the region
      // {
      //   key: 'availability_zone',
      //   label: null,
      // },
      {
        key: 'data_disk_number',
        label: 'Data disk number',
      },
      {
        key: 'instance_id',
        label: 'Instance ID',
      },
      {
        key: 'instance_type',
        label: 'Instance type',
      },
      {
        key: 'region',
        label: 'Region',
      },
      {
        key: 'vpc_id',
        label: 'VPC ID',
      },
    ];

    it('should render with AWS metadata', () => {
      const awsMetadata = {
        account_id: '123456',
        ami_id: 'ami-67890',
        availability_zone: 'eu-west-1a',
        data_disk_number: 1,
        instance_id: 'i-44444',
        instance_type: 't3.micro',
        region: 'eu-west-1',
        vpc_id: 'vpc-99999',
      };

      render(
        <ProviderDetails provider={AWS_PROVIDER} provider_data={awsMetadata} />
      );

      expect(screen.getByText('AWS')).toBeVisible();

      metadataLabels.forEach(({ key, label }) => {
        expect(screen.queryByText(label)).toBeVisible();

        expect(screen.queryByText(label).nextSibling).toHaveTextContent(
          awsMetadata[key],
          { exact: false }
        );
      });
    });

    it('should render without AWS', () => {
      render(<ProviderDetails provider={AWS_PROVIDER} provider_data={null} />);

      expect(screen.getByText('AWS')).toBeVisible();

      metadataLabels.forEach(({ _, label }) => {
        expect(screen.queryByText(label)).toBeNull();
      });
    });
  });
});
