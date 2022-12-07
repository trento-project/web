import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Button from '.';

describe('Button', () => {
  it('should display a button with its text', () => {
    render(<Button>Hello there General Kenobi</Button>);
    expect(screen.getByRole('button')).toHaveTextContent(
      'Hello there General Kenobi'
    );
  });
});
