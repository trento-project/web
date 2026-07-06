// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';
import AIAssistantDisabledTrigger from './AIAssistantDisabledTrigger';

describe('AIAssistantDisabledTrigger', () => {
  it('renders a disabled launcher button', () => {
    renderWithRouter(<AIAssistantDisabledTrigger />);

    const button = screen.getByTestId('ai-assistant-trigger-disabled');
    expect(button).toBeDisabled();
  });

  it('shows a tooltip on hover pointing to the Profile page', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AIAssistantDisabledTrigger />);

    await user.hover(screen.getByTestId('ai-assistant-trigger-disabled'));

    expect(
      await screen.findByText(/AI Assistant is disabled/i)
    ).toBeInTheDocument();

    const profileLink = screen.getByRole('link', { name: 'Profile' });
    expect(profileLink).toHaveAttribute('href', '/profile');
  });
});
