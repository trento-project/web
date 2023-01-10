import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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
      providerText: 'KVM',
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
});
