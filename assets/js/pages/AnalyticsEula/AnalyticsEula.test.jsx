// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';

import { networkClient } from '@lib/network';
import { withState } from '@lib/test-utils';

import AnalyticsEula from './AnalyticsEula';

describe('AnalyticsEula component', () => {
  const setup = ({
    analyticsConfigEnabled = true,
    analyticsEulaAccepted = false,
    userID = 1,
  } = {}) => {
    const mockCapture = jest.fn();

    const axiosMock = new MockAdapter(networkClient);
    axiosMock.onPatch(`/api/v1/profile`).reply(200, {});

    const [ComponentWithState] = withState(
      <AnalyticsEula
        analyticsConfigEnabled={analyticsConfigEnabled}
        analyticsCapture={mockCapture}
        isAnalyticsLoadedFunc={() => true}
      />,
      {
        user: { id: userID, analytics_eula_accepted: analyticsEulaAccepted },
      }
    );

    render(ComponentWithState);

    return { mockCapture };
  };

  it('should emit eula_displayed when the eula modal is shown', async () => {
    const { mockCapture } = setup({ analyticsEulaAccepted: false });

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith(1, 'eula_displayed', {})
    );
  });

  it('should not emit eula_displayed when the eula was already accepted', () => {
    const { mockCapture } = setup({ analyticsEulaAccepted: true });

    expect(mockCapture).not.toHaveBeenCalledWith(
      expect.anything(),
      'eula_displayed',
      expect.anything()
    );
  });

  it('should not emit eula_displayed if analytics usage is not configured', () => {
    const { mockCapture } = setup({
      analyticsConfigEnabled: false,
      analyticsEulaAccepted: false,
    });

    expect(mockCapture).not.toHaveBeenCalledWith(
      expect.anything(),
      'eula_displayed',
      expect.anything()
    );
  });

  it('should emit eula_accepted when the Enable button is clicked', async () => {
    const user = userEvent.setup();
    const { mockCapture } = setup();

    await user.click(
      screen.getByRole('button', { name: 'Enable Analytics Collection' })
    );

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith(1, 'eula_accepted', {})
    );
  });

  it('should emit eula_temporary_declined when declining without checking "never show again"', async () => {
    const user = userEvent.setup();
    const { mockCapture } = setup();

    await user.click(
      screen.getByRole('button', { name: 'Continue without Analytics' })
    );

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith(1, 'eula_temporary_declined', {})
    );
  });

  it('should emit eula_declined when declining with "never show again" checked', async () => {
    const user = userEvent.setup();
    const { mockCapture } = setup();

    await user.click(screen.getByRole('checkbox'));
    await user.click(
      screen.getByRole('button', { name: 'Continue without Analytics' })
    );

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith(1, 'eula_declined', {})
    );
  });
});
