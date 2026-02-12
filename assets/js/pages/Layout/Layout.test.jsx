import React from 'react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { renderWithRouter, withDefaultState } from '@lib/test-utils';

// stub ProfileMenu globally for these tests to avoid headlessui complexity
jest.mock('@common/ProfileMenu', () => ({
  __esModule: true,
  default: ({ logout }) => <button onClick={logout}>Sign out</button>,
}));

// stub AnalyticsEula, which uses headlessui Dialog, to avoid headlessui side-effects
jest.mock('@pages/AnalyticsEula', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@lib/auth', () => ({
  clearCredentialsFromStore: jest.fn(),
}));

jest.mock('@lib/analytics', () => ({
  identify: jest.fn(),
  optinCapturing: jest.fn(),
  reset: jest.fn(),
}));

describe('Layout logout behavior', () => {
  // Helper that renders Layout, clicks 'Sign out' and returns the mocked modules
  async function renderAndLogout({ basePath } = {}) {
    const user = userEvent.setup();

    const auth = require('@lib/auth');
    const analytics = require('@lib/analytics');

    // Ensure mocks exist and start from a clean state
    auth.clearCredentialsFromStore.mockReset();
    analytics.optinCapturing.mockReset();
    analytics.reset.mockReset();
    auth.clearCredentialsFromStore.mockImplementation(() => {});
    analytics.optinCapturing.mockImplementation(() => {});
    analytics.reset.mockImplementation(() => {});

    if (typeof basePath === 'string') {
      global.window.basePath = basePath;
    } else {
      delete global.window.basePath;
    }

    // jsdom doesn't implement navigation; suppress the console noise during the click
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const Layout = require('./Layout').default;
    const [StatefulLayout] = withDefaultState(<Layout />);
    const { getByRole } = renderWithRouter(StatefulLayout);

    await user.click(getByRole('button', { name: /Sign out/i }));

    // restore console
    consoleErrorSpy.mockRestore();

    // cleanup basePath so it doesn't leak between tests
    delete global.window.basePath;

    return { auth, analytics };
  }

  it('redirects to `/session/new` when not using a subpath', async () => {
    const { auth, analytics } = await renderAndLogout({ basePath: undefined });

    expect(auth.clearCredentialsFromStore).toHaveBeenCalled();
    expect(analytics.optinCapturing).toHaveBeenCalledWith(false);
    expect(analytics.reset).toHaveBeenCalled();
  });

  it('redirects to `${basePath}/session/new` when using a subpath', async () => {
    const { auth, analytics } = await renderAndLogout({ basePath: '/trento' });

    expect(auth.clearCredentialsFromStore).toHaveBeenCalled();
    expect(analytics.optinCapturing).toHaveBeenCalledWith(false);
    expect(analytics.reset).toHaveBeenCalled();
  });
});
