import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import { Route, Routes } from 'react-router-dom';
import { renderWithRouter, withState } from '@lib/test-utils';
import Guard from './Guard';

describe('Guard component', () => {
  it('should redirect to the redirectPath prop when the user cannot be loaded', async () => {
    const badGetUser = () => Promise.reject(Error('the reason is you'));
    const [StatefulGuard] = withState(
      <Routes>
        <Route
          element={<Guard redirectPath="/session/new" getUser={badGetUser} />}
        >
          <Route
            path="/"
            element={<div data-testid="inner-component"> test </div>}
          />
        </Route>
      </Routes>,
      {
        user: {
          loggedIn: false,
        },
      }
    );

    renderWithRouter(StatefulGuard);

    await act(() => {});

    expect(window.location.pathname).toEqual('/session/new');
  });

  it('should render the outler when the user can be loaded', async () => {
    const goodGetUser = () => Promise.resolve({ username: 'admin' });
    const [StatefulGuard] = withState(
      <Routes>
        <Route
          element={<Guard redirectPath="/session/new" getUser={goodGetUser} />}
        >
          <Route
            path="/"
            element={<div data-testid="inner-component"> test </div>}
          />
        </Route>
      </Routes>,
      {
        user: {
          loggedIn: false,
        },
      }
    );

    renderWithRouter(StatefulGuard);

    await waitFor(() => {
      expect(screen.getByTestId('inner-component')).toBeDefined();
    });
  });
});
