import React from 'react';
import { render, screen } from '@testing-library/react';

import AnalyticsEulaModal from './AnalyticsEulaModal';

describe('Analytics Eula Modal component', () => {
  it('should render the Analytics Eula modal correctly', async () => {
    render(
      <AnalyticsEulaModal isOpen onEnable={() => {}} onCancel={() => {}} />
    );

    expect(
      await screen.findByText('Collection of Anonymous Metrics')
    ).toBeTruthy();
    expect(
      await screen.findByText('Allow the collection of', { exact: false })
    ).toBeTruthy();

    expect(await screen.findByRole('checkbox')).toBeTruthy();
    expect(
      await screen.findByText('Never show this message again.')
    ).toBeTruthy();

    expect(
      await screen.findByRole('button', { name: 'Enable Analytics Collection' })
    ).toBeTruthy();
    expect(
      await screen.findByRole('button', { name: 'Continue without Analytics' })
    ).toBeTruthy();
  });
});
