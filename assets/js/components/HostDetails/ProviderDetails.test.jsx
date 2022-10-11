import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProviderDetails from './ProviderDetails';

describe('Provider Details', () => {
  it('should display a box with Azure as the provider', () => {
    render(<ProviderDetails provider="azure" />);
    expect(screen.getAllByText(/Provider/)).toBeTruthy();
    expect(screen.getAllByText(/azure/)).toBeTruthy();
  });
  it('should display a box with AWS as the provider', () => {
    render(<ProviderDetails provider="aws" />);
    expect(screen.getAllByText(/Provider/)).toBeTruthy();
    expect(screen.getAllByText(/aws/)).toBeTruthy();
  });
  it('should display a box with GCP as the provider', () => {
    render(<ProviderDetails provider="gcp" />);
    expect(screen.getAllByText(/Provider/)).toBeTruthy();
    expect(screen.getAllByText(/gcp/)).toBeTruthy();
  });
  it('should display a box with KVM as the provider', () => {
    render(<ProviderDetails provider="kvm" />);
    expect(screen.getAllByText(/Provider/)).toBeTruthy();
    expect(screen.getAllByText(/kvm/)).toBeTruthy();
  });
  it('should display a box with Nutanix as the provider', () => {
    render(<ProviderDetails provider="nutanix" />);
    expect(screen.getAllByText(/Provider/)).toBeTruthy();
    expect(screen.getAllByText(/nutanix/)).toBeTruthy();
  });
  it('should display an element containing "Provider not recognized"', () => {
    render(<ProviderDetails provider="unrecognized-provider" />);
    expect(document.querySelector('span')).toHaveTextContent(
      'Provider not recognized'
    );
  });
});
