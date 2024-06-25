import React from 'react';

import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Button from '@common/Button';
import Tooltip from '@common/Tooltip';

import DisabledGuard from './DisabledGuard';

describe('DisabledGuard component', () => {
  it('should disable the children component if the user is not authorized', () => {
    render(
      <DisabledGuard userAbilities={[]} permitted={['action:resource']}>
        <Button>Click me!</Button>
      </DisabledGuard>
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should not disable children component if the user is authorized', () => {
    render(
      <DisabledGuard
        userAbilities={[{ name: 'action', resource: 'resource' }]}
        permitted={['action:resource']}
      >
        <Button>Click me!</Button>
      </DisabledGuard>
    );

    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('should not disable children component if the user has all:all ability', () => {
    render(
      <DisabledGuard
        userAbilities={[{ name: 'all', resource: 'all' }]}
        permitted={['action:resource']}
      >
        <Button>Click me!</Button>
      </DisabledGuard>
    );

    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('should supersede the tooltip if the user is not authorized', async () => {
    const user = userEvent.setup();

    render(
      <DisabledGuard userAbilities={[]} permitted={['action:resource']}>
        <Tooltip content="This is my tooltip text" wrap={false}>
          <Button>Click me!</Button>
        </Tooltip>
      </DisabledGuard>
    );

    expect(screen.getByRole('button')).toBeDisabled();

    await act(async () => user.hover(screen.getByRole('button')));

    await waitFor(() =>
      expect(
        screen.queryByText('You are not authorized for this action')
      ).toBeVisible()
    );
  });
});
