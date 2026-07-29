// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import AIConfigurationClearModal from '.';

describe('AIConfigurationClearModal', () => {
  it('shows the modal title when open', async () => {
    await act(() =>
      render(
        <AIConfigurationClearModal
          open
          onClearSettings={() => {}}
          onCancel={() => {}}
        />
      )
    );

    expect(screen.getByText('Clear AI Configuration')).toBeInTheDocument();
  });

  it("clicking 'Clear Settings' calls onClearSettings", async () => {
    const user = userEvent.setup();
    const onClearSettings = jest.fn();

    await act(() =>
      render(
        <AIConfigurationClearModal
          open
          onClearSettings={onClearSettings}
          onCancel={() => {}}
        />
      )
    );

    await user.click(screen.getByText('Clear Settings'));
    expect(onClearSettings).toHaveBeenCalled();
  });

  it("clicking 'Cancel' calls onCancel", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    await act(() =>
      render(
        <AIConfigurationClearModal
          open
          onClearSettings={() => {}}
          onCancel={onCancel}
        />
      )
    );

    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
