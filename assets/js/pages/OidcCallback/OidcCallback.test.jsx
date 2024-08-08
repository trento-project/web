import React from 'react';
import { screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { withState, renderWithRouterMatch } from '@lib/test-utils';
import OidcCallback from './OidcCallback';

describe('OidcCallback component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should display loading state when authentication is happening', async () => {
    const [StatefulOidCallback, store] = withState(<OidcCallback />, {
      user: {},
    });

    renderWithRouterMatch(StatefulOidCallback, {
      path: 'auth/oidc_callback',
      route: `/auth/oidc_callback?code=code&state=state`,
    });

    expect(screen.getByText('Loading...')).toBeVisible();

    expect(store.getActions()).toContainEqual({
      type: 'PERFORM_OIDC_ENROLLMENT',
      payload: { code: 'code', state: 'state' },
    });
  });

  it('should display an error message if some search param is missing', async () => {
    const user = userEvent.setup();

    const [StatefulOidCallback] = withState(<OidcCallback />, {
      user: {},
    });

    renderWithRouterMatch(StatefulOidCallback, {
      path: 'auth/oidc_callback',
      route: `/auth/oidc_callback?code=code`,
    });

    expect(screen.getByText('Login Failed')).toBeVisible();

    expect(
      screen.getByText('An error occurred while trying to Login', {
        exact: false,
      })
    ).toBeVisible();

    const loginButton = screen.getByRole('button', {
      name: 'Login with Single Sign-on',
    });
    user.click(loginButton);

    expect(window.location.pathname).toBe('/auth/oidc_callback');
  });

  it('should display an error message if authentication fails', async () => {
    const [StatefulOidCallback] = withState(<OidcCallback />, {
      user: {
        authError: true,
      },
    });

    renderWithRouterMatch(StatefulOidCallback, {
      path: 'auth/oidc_callback',
      route: `/auth/oidc_callback?code=code&state=state`,
    });

    expect(screen.getByText('Login Failed')).toBeVisible();

    expect(
      screen.getByText('An error occurred while trying to Login', {
        exact: false,
      })
    ).toBeVisible();
  });

  it('should navigate to home after user is logged in', () => {
    const [StatefulOidCallback] = withState(<OidcCallback />, {
      user: {
        loggedIn: true,
      },
    });

    renderWithRouterMatch(StatefulOidCallback, {
      path: '',
      route: '/',
    });

    expect(window.location.pathname).toBe('/');
  });
});
