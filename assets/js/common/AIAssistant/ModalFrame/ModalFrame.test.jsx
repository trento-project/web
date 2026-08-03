// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { renderWithRouter } from '@lib/test-utils';

import ModalFrame from './ModalFrame';

const renderFrame = (props = {}) =>
  renderWithRouter(
    <ModalFrame open={false} onOpenChange={() => {}} {...props}>
      <p>chat panel body</p>
    </ModalFrame>
  );

describe('ModalFrame', () => {
  describe('enabled launcher', () => {
    it('renders the enabled trigger', () => {
      renderFrame();

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-label', 'Open AI Assistant');
      expect(trigger).toBeEnabled();
    });

    it('opens the modal when the trigger is clicked', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      renderFrame({ onOpenChange });

      await user.click(screen.getByRole('button'));

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('renders its children while open', () => {
      renderFrame({ open: true });

      expect(screen.getByText('chat panel body')).toBeVisible();
    });
  });

  describe('disabled launcher', () => {
    it('renders a disabled trigger', () => {
      renderFrame({ disabled: true });

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('aria-label', 'AI Assistant is disabled');
      expect(trigger).toBeDisabled();

      expect(
        screen.queryByRole('button', { name: 'Open AI Assistant' })
      ).not.toBeInTheDocument();
    });

    it('cannot open the chat when the trigger is disabled', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      renderFrame({ disabled: true, onOpenChange });

      const trigger = screen.getByRole('button');

      expect(trigger).not.toHaveAttribute('aria-expanded');

      await user.click(trigger, { pointerEventsCheck: 0 });

      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('points at the Profile page on hover', async () => {
      const user = userEvent.setup();
      renderFrame({ disabled: true });

      await user.hover(screen.getByRole('button'));

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
