import React from 'react';

import { render, screen } from '@testing-library/react';
import 'intersection-observer';
import '@testing-library/jest-dom';
import { Route, Routes } from 'react-router';
import { renderWithRouter, withState } from '@lib/test-utils';
import ForbiddenGuard from './ForbiddenGuard';

describe('ForbiddenGuard component', () => {
  describe('Normal guard', () => {
    it('should permit children if the user is authorized', () => {
      const [StatefulGuard] = withState(
        <ForbiddenGuard permitted={['show:test']}>
          <div>Permitted</div>
        </ForbiddenGuard>,
        {
          user: {
            abilities: [{ name: 'show', resource: 'test' }],
          },
        }
      );

      render(StatefulGuard);

      expect(screen.getByText('Permitted')).toBeVisible();
    });

    it('should permit for user with all abilities', () => {
      const [StatefulGuard] = withState(
        <ForbiddenGuard permitted={[]}>
          <div>Permitted</div>
        </ForbiddenGuard>,
        {
          user: {
            abilities: [{ name: 'all', resource: 'all' }],
          },
        }
      );

      render(StatefulGuard);

      expect(screen.getByText('Permitted')).toBeVisible();
    });

    it('should forbid and return null if user is not authorized', () => {
      const [StatefulGuard] = withState(
        <ForbiddenGuard permitted={['show:test']}>
          <div>Permitted</div>
        </ForbiddenGuard>,
        {
          user: {
            abilities: [],
          },
        }
      );

      render(StatefulGuard);

      expect(screen.queryByText('Permitted')).not.toBeInTheDocument();
    });

    it('should skip authorization check if the guard is disabled', () => {
      const [StatefulGuard] = withState(
        <ForbiddenGuard permitted={['show:test']} disabled>
          <div>Permitted</div>
        </ForbiddenGuard>,
        {
          user: {
            abilities: [],
          },
        }
      );

      render(StatefulGuard);

      expect(screen.getByText('Permitted')).toBeVisible();
    });
  });

  describe('Outlet mode', () => {
    it('should show a permitted outlet', async () => {
      const [StatefulGuard] = withState(
        <Routes>
          <Route
            element={<ForbiddenGuard outletMode permitted={['all:all']} />}
          >
            <Route path="/" element={<div>Outlet content</div>} />
          </Route>
        </Routes>,
        {
          user: {
            abilities: [{ name: 'all', resource: 'all' }],
          },
        }
      );

      renderWithRouter(StatefulGuard);

      expect(screen.getByText('Outlet content')).toBeVisible();
    });

    it('should show a forbidden view if the user is not authorized', async () => {
      const [StatefulGuard] = withState(
        <Routes>
          <Route
            element={<ForbiddenGuard outletMode permitted={['all:all']} />}
          >
            <Route path="/" element={<div>Outlet content</div>} />
          </Route>
        </Routes>,
        {
          user: {
            abilities: [],
          },
        }
      );

      renderWithRouter(StatefulGuard);

      expect(
        screen.getByText('Access to this page is forbidden')
      ).toBeVisible();
    });
  });
});
