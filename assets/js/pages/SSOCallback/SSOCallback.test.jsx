import React from 'react';
import { screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { withState, renderWithRouterMatch } from '@lib/test-utils';
import SSOCallback from './SSOCallback';

describe('SSOCallback component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should perform a SSO enrollment and display loading state when authentication is happening', async () => {
    const [StatefulOidCallback, store] = withState(<SSOCallback />, {
      user: {},
    });

    renderWithRouterMatch(StatefulOidCallback, {
      path: 'auth/oidc_callback',
      route: `/auth/oidc_callback?code=code&state=state`,
    });

    expect(screen.getByText('Loading...')).toBeVisible();

    expect(store.getActions()).toContainEqual({
      type: 'PERFORM_SSO_ENROLLMENT',
      payload: { code: 'code', state: 'state' },
    });
  });

  it('should perform a SAML enrollment and display loading state when authentication is happening', async () => {
    const [StatefulOidCallback, store] = withState(<SSOCallback />, {
      user: {},
    });

    renderWithRouterMatch(StatefulOidCallback, {
      path: 'auth/saml_callback',
      route: `/auth/saml_callback`,
    });

    expect(screen.getByText('Loading...')).toBeVisible();

    expect(store.getActions()).toContainEqual({
      type: 'PERFORM_SAML_ENROLLMENT',
      payload: {},
    });
  });

  it('should display an error message if authentication fails', async () => {
    const user = userEvent.setup();

    const [StatefulOidCallback] = withState(<SSOCallback />, {
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

    const loginButton = screen.getByRole('button', {
      name: 'Login with Single Sign-on',
    });
    user.click(loginButton);

    expect(window.location.pathname).toBe('/auth/oidc_callback');
  });

  it('should navigate to home after user is logged in', () => {
    const [StatefulOidCallback] = withState(<SSOCallback />, {
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
