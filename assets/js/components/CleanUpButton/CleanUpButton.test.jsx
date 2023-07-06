import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import CleanUpButton from '.';

describe('Button', () => {
  it('should display the clean up button', () => {
    render(<CleanUpButton />);
    expect(screen.getByRole('button')).toHaveTextContent('Clean up');
  });

  it('should display the clean up in cleaning state', () => {
    render(<CleanUpButton cleaning />);
    const spinnerElement = screen.getByRole('alert');
    expect(spinnerElement).toBeInTheDocument();
  });
});
