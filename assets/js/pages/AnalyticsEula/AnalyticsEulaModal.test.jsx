import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AnalyticsEulaModal from './AnalyticsEulaModal';

describe('Analytics Eula Modal component', () => {
  it('should render the Analytics Eula modal correctly', async () => {
    render(<AnalyticsEulaModal isOpen />);

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

  it('should call onEnable when Enable button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnEnable = jest.fn();

    render(<AnalyticsEulaModal isOpen onEnable={mockOnEnable} />);

    await user.click(
      screen.getByRole('button', { name: 'Enable Analytics Collection' })
    );

    expect(mockOnEnable).toHaveBeenCalledWith(false);
  });

  it('should call onCancel when Close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnCancel = jest.fn();

    render(<AnalyticsEulaModal isOpen onCancel={mockOnCancel} />);

    await user.click(
      screen.getByRole('button', { name: 'Continue without Analytics' })
    );

    expect(mockOnCancel).toHaveBeenCalledWith(false);
  });

  it('should return true when checkbox is checked and Close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnCancel = jest.fn();

    render(<AnalyticsEulaModal isOpen onCancel={mockOnCancel} />);

    await user.click(screen.getByRole('checkbox'));
    await user.click(
      screen.getByRole('button', { name: 'Continue without Analytics' })
    );

    expect(mockOnCancel).toHaveBeenCalledWith(true);
  });
});
