// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import SuseMultiLinuxManagerClearSettingsModal from '.';

describe('SuseMultiLinuxManagerClearSettingsModal', () => {
  it("Clicking 'Clear Settings' button clears the SUSE Multi-Linux Manager settings", async () => {
    const user = userEvent.setup();
    const onClearSettings = jest.fn();

    await act(() =>
      render(
        <SuseMultiLinuxManagerClearSettingsModal
          open
          onClearSettings={onClearSettings}
          onCancel={() => {}}
        />
      )
    );

    expect(
      screen.getByText('Clear SUSE Multi-Linux Manager Settings')
    ).toBeInTheDocument();

    await user.click(screen.getByText('Clear Settings'));
    expect(onClearSettings).toHaveBeenCalled();
  });

  it("Clicking 'Cancel' button cancels the dialog", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    await act(() =>
      render(
        <SuseMultiLinuxManagerClearSettingsModal
          open
          onClearSettings={() => {}}
          onCancel={onCancel}
        />
      )
    );

    expect(
      screen.getByText('Clear SUSE Multi-Linux Manager Settings')
    ).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
