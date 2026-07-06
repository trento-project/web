// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';
import AIAssistant from './AIAssistant';

describe('AIAssistant', () => {
  describe('when the user has no AI settings', () => {
    it('renders a disabled launcher button', () => {
      renderWithRouter(<AIAssistant userID="1" aiConfigured={false} />);

      expect(
        screen.getByTestId('ai-assistant-trigger-disabled')
      ).toBeDisabled();
    });

    it('shows a tooltip on hover pointing to the Profile page', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AIAssistant userID="1" aiConfigured={false} />);

      await user.hover(screen.getByTestId('ai-assistant-trigger-disabled'));

      expect(
        await screen.findByText(/AI Assistant is disabled/i)
      ).toBeInTheDocument();

      expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute(
        'href',
        '/profile'
      );
    });
  });
});
