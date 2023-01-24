import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProviderLabel, {
  getProviderByLabel,
  providerData,
  getLabels,
} from './ProviderLabel';

describe('Provider Label', () => {
  it('should display an icon and label with AWS as the provider', () => {
    const { container } = render(<ProviderLabel provider="aws" />);
    expect(screen.getAllByText(/AWS/)).toBeTruthy();
    expect(container.querySelector('img').getAttribute('alt')).toContain('aws');
  });
  it('should display an icon and label with Azure as the provider', () => {
    const { container } = render(<ProviderLabel provider="azure" />);
    expect(screen.getAllByText(/Azure/)).toBeTruthy();
    expect(container.querySelector('img').getAttribute('alt')).toContain(
      'azure'
    );
  });
  it('should display an icon and label with GCP as the provider', () => {
    const { container } = render(<ProviderLabel provider="gcp" />);
    expect(screen.getAllByText(/GCP/)).toBeTruthy();
    expect(container.querySelector('img').getAttribute('alt')).toContain('gcp');
  });
  it('should display an icon and label with KVM as the provider', () => {
    const { container } = render(<ProviderLabel provider="kvm" />);
    expect(screen.getAllByText(/KVM/)).toBeTruthy();
    expect(container.querySelector('img').getAttribute('alt')).toContain('kvm');
  });
  it('should display an icon and label with Nutanix as the provider', () => {
    const { container } = render(<ProviderLabel provider="nutanix" />);
    expect(screen.getAllByText(/Nutanix/)).toBeTruthy();
    expect(container.querySelector('img').getAttribute('alt')).toContain(
      'nutanix'
    );
  });
  it('should display an element containing "Provider not recognized"', () => {
    const { container } = render(
      <ProviderLabel provider="unrecognized-provider" />
    );
    expect(container.querySelector('span')).toHaveTextContent(
      'Provider not recognized'
    );
  });

  describe('Provider Labels functions: ', () => {
    it('should return a list of all Provider labels', () => {
      const expectedProviderLabels = ['AWS', 'Azure', 'GCP', 'Nutanix', 'KVM'];
      expect(getLabels(providerData)).toEqual(expectedProviderLabels);
    });

    it('should returns the key value of provider from the label value ', () => {
      const label = 'AWS';
      const expectedProviderLabels = 'aws';
      expect(getProviderByLabel(providerData, label)).toEqual(
        expectedProviderLabels
      );
    });
  });
});
