import React from 'react';
import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Button from '.';

describe('Button', () => {
  it('should display a button with its text', () => {
    const content = faker.vehicle.vehicle();
    render(<Button>{content}</Button>);
    expect(screen.getByRole('button')).toHaveTextContent(content);
  });

  it('should display a disabled button with its text', () => {
    const content = faker.vehicle.vehicle();
    render(<Button disabled>{content}</Button>);
    expect(screen.getByRole('button')).toHaveTextContent(content);
  });
});
