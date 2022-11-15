import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProviderLabel from './ProviderLabel';

describe('Provider Label', () => {
  it('should display an icon and label with AWS as the provider', () => {
    render(<ProviderLabel provider="aws" />);
    expect(screen.getAllByText(/AWS/)).toBeTruthy();
    expect(document.querySelector('img').getAttribute('alt')).toContain('aws');
  });
  it('should display an icon and label with Azure as the provider', () => {
    render(<ProviderLabel provider="azure" />);
    expect(screen.getAllByText(/Azure/)).toBeTruthy();
    expect(document.querySelector('img').getAttribute('alt')).toContain(
      'azure'
    );
  });
  it('should display an icon and label with GCP as the provider', () => {
    render(<ProviderLabel provider="gcp" />);
    expect(screen.getAllByText(/GCP/)).toBeTruthy();
    expect(document.querySelector('img').getAttribute('alt')).toContain('gcp');
  });
  it('should display an icon and label with KVM as the provider', () => {
    render(<ProviderLabel provider="kvm" />);
    expect(screen.getAllByText(/KVM/)).toBeTruthy();
    expect(document.querySelector('img').getAttribute('alt')).toContain('kvm');
  });
  it('should display an icon and label with Nutanix as the provider', () => {
    render(<ProviderLabel provider="nutanix" />);
    expect(screen.getAllByText(/Nutanix/)).toBeTruthy();
    expect(document.querySelector('img').getAttribute('alt')).toContain(
      'nutanix'
    );
  });
  it('should display an element containing "Provider not recognized"', () => {
    render(<ProviderLabel provider="unrecognized-provider" />);
    expect(document.querySelector('span')).toHaveTextContent(
      'Provider not recognized'
    );
  });
});
