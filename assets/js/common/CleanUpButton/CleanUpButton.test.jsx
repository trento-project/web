import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import CleanUpButton from '.';

describe('Button', () => {
  it('should display the clean up button', () => {
    render(
      <CleanUpButton userAbilities={[{ name: 'all', resource: 'all' }]} />
    );
    expect(screen.getByRole('button')).toHaveTextContent('Clean up');
  });

  it('should display the clean up in cleaning state', () => {
    render(
      <CleanUpButton
        cleaning
        userAbilities={[{ name: 'all', resource: 'all' }]}
      />
    );
    const spinnerElement = screen.getByRole('alert');
    expect(spinnerElement).toBeInTheDocument();
  });

  it('should forbid the cleanup', async () => {
    const user = userEvent.setup();

    render(<CleanUpButton userAbilities={[]} />);

    await user.hover(screen.getByText('Clean up'));

    expect(
      screen.queryByText('You are not authorized for this action')
    ).toBeVisible();
  });
});
