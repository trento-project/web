import React from 'react';
import { screen, waitFor, act } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Toaster } from 'react-hot-toast';
import { withState, renderWithRouter } from '@lib/test-utils';
import Login from './Login';

describe('Login component', () => {
  beforeAll(() => {
    // to test the toaster
    // Mock matchMedia, took example from the react hot toast testing suite
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });
  it('should redirect to the / path, when the user is already logged in', async () => {
    const [StatefulLogin] = withState(<Login />, {
      user: {
        loggedIn: true,
      },
    });

    renderWithRouter(StatefulLogin);

    expect(window.location.pathname).toEqual('/');
  });

  it('should show a message if the authentication request returns a 401', async () => {
    const [StatefulLogin] = withState(<Login />, {
      user: {
        authError: { message: 'Unauthorized', code: 401 },
      },
    });

    renderWithRouter(StatefulLogin);

    await waitFor(() => screen.getByText('Invalid credentials'));

    ['username', 'password'].forEach((id) => {
      const element = screen.getByTestId(`login-${id}`);
      expect(element).toHaveClass('border-red-300');
    });
  });

  it('should show a toast if an error occurs during the authentication and the error code is not 401', async () => {
    const error = { message: 'Error', code: 500 };

    const [StatefulLogin] = withState(
      <>
        <Toaster position="top-right" />
        <Login />
      </>,
      {
        user: {
          authError: error,
        },
      }
    );

    renderWithRouter(StatefulLogin);

    await waitFor(() =>
      screen.getByText(
        `An error occurred during login, try again: ${error.message}`
      )
    );
  });

  it('should disable the form controls and submit button when an authorization request is in progress', async () => {
    const [StatefulLogin] = withState(<Login />, {
      user: {
        authInProgress: true,
      },
    });

    renderWithRouter(StatefulLogin);

    ['username', 'password', 'submit'].forEach((id) => {
      const element = screen.getByTestId(`login-${id}`);
      expect(element.getAttribute('disabled').valueOf()).toEqual('');
    });
  });

  it('should not disable the form controls and submit button when an authorization request is in not progress', async () => {
    const [StatefulLogin] = withState(<Login />, {
      user: {
        authInProgress: false,
      },
    });

    renderWithRouter(StatefulLogin);

    ['username', 'password', 'submit'].forEach((id) => {
      const element = screen.getByTestId(`login-${id}`);
      expect(element.getAttribute('disabled')).toEqual(null);
    });
  });

  it('should initiate the login procedure when the form is submitted and validated', async () => {
    const [StatefulLogin, store] = withState(<Login />, {
      user: {
        authInProgress: false,
      },
    });

    renderWithRouter(StatefulLogin);

    const user = userEvent.setup();

    await act(async () => {
      const usernameField = screen.getByTestId('login-username');
      const passwordField = screen.getByTestId('login-password');

      await user.type(usernameField, 'admin');
      await user.type(passwordField, 'admin');

      const submitButton = screen.getByTestId('login-submit');
      await user.click(submitButton);
    });

    expect(store.getActions()).toContainEqual({
      type: 'PERFORM_LOGIN',
      payload: { username: 'admin', password: 'admin' },
    });
  });

  it('should not initiate the login procedure if the form inputs are invalid', async () => {
    const [StatefulLogin, store] = withState(<Login />, {
      user: {
        authInProgress: false,
      },
    });

    renderWithRouter(StatefulLogin);

    const user = userEvent.setup();
    await act(async () => {
      const submitButton = screen.getByTestId('login-submit');
      await user.click(submitButton);
    });

    expect(store.getActions()).toEqual([]);
  });
});
