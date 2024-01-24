import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Password from './Password';

describe('Password Component', () => {
  it('should toggle the visibility of the password', () => {
    const { container } = render(
      <Password value="some value" allowToggleVisibility />
    );

    const inputElement = container.querySelector('input');
    expect(inputElement.type).toBe('password');

    const buttonElement = screen.getByRole('button');
    fireEvent.click(buttonElement);
    expect(inputElement.type).toBe('text');

    fireEvent.click(buttonElement);
    expect(inputElement.type).toBe('password');
  });
});
