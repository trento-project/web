import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import SuseManagerClearSettingsModal from '.';

describe('SuseManagerClearSettingsModal', () => {
  it("Clicking 'Clear Settings' button clears the SUMA settings", async () => {
    const user = userEvent.setup();
    const onClearSettings = jest.fn();

    await act(async () => {
      render(
        <SuseManagerClearSettingsModal
          open
          onClearSettings={onClearSettings}
          onCancel={() => {}}
        />
      );
    });

    expect(
      screen.getByText('Clear SUSE Multi-Linux Manager Settings')
    ).toBeInTheDocument();

    await user.click(screen.getByText('Clear Settings'));
    expect(onClearSettings).toHaveBeenCalled();
  });

  it("Clicking 'Cancel' button cancels the dialog", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    await act(async () => {
      render(
        <SuseManagerClearSettingsModal
          open
          onClearSettings={() => {}}
          onCancel={onCancel}
        />
      );
    });

    expect(
      screen.getByText('Clear SUSE Multi-Linux Manager Settings')
    ).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
